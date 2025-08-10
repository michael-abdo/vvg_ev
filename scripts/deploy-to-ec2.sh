#!/bin/bash
# Deploy VVG Template to EC2 using Docker

set -e

# Configuration
INSTANCE_ID="${EC2_INSTANCE_ID}"
DOCKER_IMAGE="vvg-template:latest"
DOCKER_TAR="vvg-template.tar.gz"
REMOTE_DIR="/home/ubuntu/vvg-template"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment to EC2...${NC}"

# Step 1: Build Docker image
echo "Building Docker image..."
docker build -t ${DOCKER_IMAGE} .

# Step 2: Save Docker image to tar
echo "Saving Docker image..."
docker save ${DOCKER_IMAGE} | gzip > ${DOCKER_TAR}

# Step 3: Get file size for progress tracking
FILE_SIZE=$(stat -f%z ${DOCKER_TAR} 2>/dev/null || stat -c%s ${DOCKER_TAR})
echo "Docker image size: $(numfmt --to=iec-i --suffix=B ${FILE_SIZE})"

# Step 4: Transfer files to EC2 using SSM
echo "Creating deployment directory on EC2..."
aws ssm send-command \
    --instance-ids ${INSTANCE_ID} \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=['mkdir -p ${REMOTE_DIR}']" \
    --output text

# Step 5: Transfer Docker image using S3 (SSM doesn't support direct file transfer)
BUCKET_NAME="${S3_DEPLOYMENT_BUCKET}"
S3_KEY="deployments/vvg-template/$(date +%Y%m%d-%H%M%S)/${DOCKER_TAR}"

echo "Uploading to S3..."
aws s3 cp ${DOCKER_TAR} "s3://${BUCKET_NAME}/${S3_KEY}" --no-progress

# Step 6: Download on EC2 from S3
echo "Downloading on EC2..."
aws ssm send-command \
    --instance-ids ${INSTANCE_ID} \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=['cd ${REMOTE_DIR} && aws s3 cp s3://${BUCKET_NAME}/${S3_KEY} ${DOCKER_TAR}']" \
    --output text

# Step 7: Load Docker image on EC2
echo "Loading Docker image on EC2..."
COMMAND_ID=$(aws ssm send-command \
    --instance-ids ${INSTANCE_ID} \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=['cd ${REMOTE_DIR} && gunzip -c ${DOCKER_TAR} | docker load']" \
    --output text --query "Command.CommandId")

# Wait for command to complete
aws ssm wait command-executed \
    --command-id ${COMMAND_ID} \
    --instance-id ${INSTANCE_ID}

# Step 8: Transfer docker-compose and config files
echo "Transferring configuration files..."
tar -czf configs.tar.gz docker-compose.prod.yml nginx/ .env.production

aws s3 cp configs.tar.gz "s3://${BUCKET_NAME}/${S3_KEY%.tar.gz}-configs.tar.gz"

aws ssm send-command \
    --instance-ids ${INSTANCE_ID} \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=['cd ${REMOTE_DIR} && aws s3 cp s3://${BUCKET_NAME}/${S3_KEY%.tar.gz}-configs.tar.gz configs.tar.gz && tar -xzf configs.tar.gz']" \
    --output text

# Step 9: Start containers
echo "Starting Docker containers..."
COMMAND_ID=$(aws ssm send-command \
    --instance-ids ${INSTANCE_ID} \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=['cd ${REMOTE_DIR} && docker-compose -f docker-compose.prod.yml up -d']" \
    --output text --query "Command.CommandId")

# Wait for command to complete
aws ssm wait command-executed \
    --command-id ${COMMAND_ID} \
    --instance-id ${INSTANCE_ID}

# Step 10: Check deployment status
echo "Checking deployment status..."
aws ssm send-command \
    --instance-ids ${INSTANCE_ID} \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=['cd ${REMOTE_DIR} && docker-compose -f docker-compose.prod.yml ps']" \
    --output text

# Clean up local files
rm -f ${DOCKER_TAR} configs.tar.gz

echo -e "${GREEN}Deployment complete!${NC}"
echo "To view logs, run:"
echo "aws ssm start-session --target ${INSTANCE_ID}"
echo "Then: cd ${REMOTE_DIR} && docker-compose -f docker-compose.prod.yml logs -f"