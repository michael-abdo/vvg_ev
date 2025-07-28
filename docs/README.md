# VVG Template Documentation & Scripts

**Complete automation suite for VVG project lifecycle management**

## 🚀 Quick Start

### Master Automation (Complete Lifecycle)
```bash
# Complete project setup: 4-5 hours → 50 minutes
./docs/vvg-master-automation.sh <project-name> [staging|production] [aws|gcp|local]

# With parallel development worktrees
./docs/vvg-master-automation.sh <project-name> [staging|production] [aws|gcp|local] --worktree

# Examples:
./docs/vvg-master-automation.sh invoice-analyzer staging aws
./docs/vvg-master-automation.sh legal-processor production gcp
./docs/vvg-master-automation.sh my-project staging aws --worktree
```

### Parallel Development Setup
```bash
# Setup worktree structure for existing project
./docs/setup-worktrees.sh <project-name> [git-repo-url]

# Daily synchronization
./docs/sync-worktrees.sh

# Launch development workflow
./docs/workflow-launcher.sh
```

## 📁 Directory Structure

```
docs/
├── README.md                    # This file
├── TEMPLATE-UPDATES.md          # Complete automation documentation
├── OPTIMIZED-SOP.md             # Streamlined workflow guide
├── SOP-GAP-ANALYSIS.md          # Infrastructure gaps analysis
├── PARALLEL-DEVELOPMENT-ANALYSIS.md # Parallel development compatibility
├── vvg-master-automation.sh     # 🎯 MASTER SCRIPT - Complete automation
├── aws-tunnel.sh                # AWS SSM tunnel automation
├── create-github-repo.sh        # GitHub repository automation
├── setup-remote-dev.sh          # Remote development environment setup
├── setup-gcloud-dev.sh          # Google Cloud development tunnel
├── setup-worktrees.sh           # Git worktree parallel development
├── sync-worktrees.sh            # Worktree synchronization
├── workflow-launcher.sh         # Universal workflow with tmux
├── hotfix-workflow.sh           # Production hotfix automation
└── [legacy docs]                # Historical documentation
```

## 🎯 Core Automation Scripts

### 1. Master Automation Engine
**File:** `vvg-master-automation.sh`  
**Purpose:** Complete project lifecycle automation  
**Time Saved:** 3.5-4.5 hours → 50 minutes

```bash
# Complete automation for any infrastructure
./docs/vvg-master-automation.sh <project-name> <environment> <infrastructure>

# Features:
# ✅ Project creation & customization
# ✅ Infrastructure provisioning  
# ✅ Repository setup & configuration
# ✅ Development environment setup
# ✅ Deployment & validation
# ✅ Comprehensive testing
# ✅ Documentation generation
```

### 2. AWS Production Tunnel
**File:** `aws-tunnel.sh`  
**Purpose:** Automate AWS SSM sessions with tmux  
**Time Saved:** 20-30 minutes → 5 minutes

```bash
# Connect to AWS production instance
./docs/aws-tunnel.sh <instance-id> <project-name> [region]

# Features:
# ✅ Automatic instance startup
# ✅ SSM session management
# ✅ Tmux session creation
# ✅ Connection persistence
# ✅ Project workspace setup
```

### 3. GitHub Repository Automation
**File:** `create-github-repo.sh`  
**Purpose:** Complete GitHub repository creation & configuration  
**Time Saved:** 10-15 minutes → 2 minutes

```bash
# Create & configure GitHub repository
./docs/create-github-repo.sh <project-name> [environment] [visibility]

# Features:
# ✅ Repository creation
# ✅ Branch protection setup
# ✅ GitHub Actions workflows
# ✅ Labels & issue templates
# ✅ Security configuration
```

### 4. Remote Development Setup
**File:** `setup-remote-dev.sh`  
**Purpose:** Complete remote development environment  
**Time Saved:** 30-45 minutes → 5 minutes

```bash
# Setup remote development environment
./docs/setup-remote-dev.sh <host> <project-name> [user]

# Features:
# ✅ System dependencies installation
# ✅ Node.js environment setup
# ✅ Claude CLI installation
# ✅ GitHub SSH configuration
# ✅ Development tools installation
```

### 5. Google Cloud Development
**File:** `setup-gcloud-dev.sh`  
**Purpose:** Google Cloud development environment automation  
**Time Saved:** 15-20 minutes → 3 minutes

```bash
# Setup GCP development environment
./docs/setup-gcloud-dev.sh <project-name> [zone] [instance-name]

# Features:
# ✅ GCP instance management
# ✅ SSH configuration
# ✅ Development environment setup
# ✅ Tmux session management
# ✅ Connection automation
```

## 🚀 Parallel Development Scripts

### 6. Worktree Setup
**File:** `setup-worktrees.sh`  
**Purpose:** Create Git worktree structure for parallel development  
**Time Saved:** 30 minutes → 5 minutes per feature branch

```bash
# Setup worktree structure
./docs/setup-worktrees.sh <project-name> [git-repo-url] [base-dir]

# Features:
# ✅ Git version validation (2.5+)
# ✅ Automatic worktree creation
# ✅ Main/staging branch setup
# ✅ Utility scripts (status, create-feature)
# ✅ Environment isolation per worktree

# Creates structure:
# ~/projects/project-name/
#   ├── main/                    # Production worktree
#   ├── project-staging/         # Staging worktree
#   ├── project-feature-xyz/     # Feature worktrees
#   └── bin/                     # Shared utilities
```

### 7. Worktree Synchronization
**File:** `sync-worktrees.sh`  
**Purpose:** Daily rebase and synchronization across all worktrees  
**Time Saved:** 10 minutes → 2 minutes per sync

```bash
# Sync all worktrees with upstream
./docs/sync-worktrees.sh [--force] [--no-backup]

# Features:
# ✅ Automatic backup creation
# ✅ Conflict detection
# ✅ Safe rebase with rollback
# ✅ Status reporting
# ✅ Stash management
```

### 8. Workflow Launcher
**File:** `workflow-launcher.sh`  
**Purpose:** Launch optimized tmux development environment  
**Time Saved:** 15 minutes → 1 minute per session

```bash
# Launch workflow in current worktree
./docs/workflow-launcher.sh [worktree-name] [--new-session]

# Features:
# ✅ Auto-detect worktree context
# ✅ Tmux session per worktree
# ✅ Claude CLI integration
# ✅ Git status monitoring
# ✅ Port assignment (3000, 3001, 3010+)
# ✅ EXECUTE → COMPARE → COMMIT workflow
```

### 9. Hotfix Workflow
**File:** `hotfix-workflow.sh`  
**Purpose:** Enforce proper production hotfix procedures  
**Time Saved:** 45 minutes → 10 minutes per hotfix

```bash
# Create production hotfix
./docs/hotfix-workflow.sh <hotfix-name> [--emergency]

# Features:
# ✅ Production tag validation
# ✅ Hotfix branch from latest tag
# ✅ Automated testing
# ✅ PR template creation
# ✅ Rollback plan included
# ✅ Deployment automation
```

## 📖 Documentation Files

### Primary Documentation
- **`TEMPLATE-UPDATES.md`** - Complete documentation of all 8 automation scripts
- **`OPTIMIZED-SOP.md`** - Streamlined workflow: 20+ steps → 8 commands  
- **`SOP-GAP-ANALYSIS.md`** - Analysis of automation opportunities and infrastructure gaps
- **`PARALLEL-DEVELOPMENT-ANALYSIS.md`** - Worktree compatibility analysis and integration guide

### Legacy Documentation
- **`MASTER.md`** - Historical master documentation
- **`STATUS.md`** - Previous project status
- **`UX.md`** - User experience documentation
- **`DRY-REFACTORING-*.md`** - DRY refactoring documentation
- **`git-workflow.md`** - Git workflow documentation

## ⚡ Time Savings Summary

| Process | Manual Time | Automated Time | Savings |
|---------|-------------|----------------|---------|
| **Complete Project Setup** | 4-5 hours | 50 minutes | 3.5-4.5 hours |
| **AWS Tunnel Setup** | 20-30 min | 5 minutes | 15-25 min |
| **GitHub Repository** | 10-15 min | 2 minutes | 8-13 min |
| **Remote Dev Setup** | 30-45 min | 5 minutes | 25-40 min |
| **GCP Development** | 15-20 min | 3 minutes | 12-17 min |
| **Worktree Setup** | 30 min | 5 minutes | 25 min |
| **Feature Branch** | 15 min | 2 minutes | 13 min |
| **Daily Sync** | 10 min | 2 minutes | 8 min |
| **Hotfix Deploy** | 45 min | 10 minutes | 35 min |

**Standard Setup:** 4-5 hours → 50 minutes saved  
**With Parallel Development:** Additional 30-35 hours/month saved  
**Total Efficiency Gain:** 90-95% reduction in setup/maintenance time

## 🎯 Usage Workflows

### New Project (Complete Setup)
```bash
# 1. Run master automation
./docs/vvg-master-automation.sh invoice-analyzer staging aws

# 2. Connect to infrastructure (if AWS)
./docs/aws-tunnel.sh i-1234567890abcdef0 invoice-analyzer

# 3. Start development
npm run dev
```

### AWS Production Environment
```bash
# 1. Setup infrastructure
./scripts/provision-infrastructure.sh invoice-analyzer production

# 2. Connect via tunnel
./docs/aws-tunnel.sh i-1234567890abcdef0 invoice-analyzer us-east-1

# 3. Deploy application
./scripts/deploy-env.sh production
```

### Google Cloud Development
```bash
# 1. Setup GCP development environment
./docs/setup-gcloud-dev.sh invoice-analyzer us-central1-a

# 2. Connect to development instance
gcp-dev-invoice-analyzer

# 3. Start development
cd ~/invoice-analyzer && npm run dev
```

### Remote Development Server
```bash
# 1. Setup remote development environment
./docs/setup-remote-dev.sh staging.vtc.systems invoice-analyzer

# 2. SSH to server
ssh ec2-user@staging.vtc.systems

# 3. Navigate to project
cd ~/invoice-analyzer
```

### Parallel Development Workflow
```bash
# 1. Initial setup with worktrees
./docs/vvg-master-automation.sh my-project staging aws --worktree
# OR for existing project:
./docs/setup-worktrees.sh my-project

# 2. Daily workflow
cd ~/projects/my-project/my-project-staging
./docs/sync-worktrees.sh                  # Sync all worktrees
./docs/workflow-launcher.sh               # Launch tmux environment

# 3. Feature development
~/projects/my-project/bin/create-feature new-feature
cd ~/projects/my-project/project-new-feature
./docs/workflow-launcher.sh               # Isolated tmux session

# 4. Hotfix workflow
./docs/hotfix-workflow.sh critical-fix
cd ~/projects/my-project/hotfix-critical-fix
# Fix → Test → ./create-hotfix-pr.sh

# 5. Status check
~/projects/my-project/bin/worktree-status
```

### Testing Parallel Development
```bash
# Run comprehensive tests
./scripts/test-parallel-development.sh

# With cleanup
./scripts/test-parallel-development.sh --cleanup
```

## 🔧 Script Dependencies

### Required Tools
- **Git 2.5+** - Version control (2.5+ required for worktrees)
- **Node.js 18+** - Runtime environment
- **npm/pnpm** - Package management
- **PM2** - Process management
- **curl** - HTTP client
- **jq** - JSON processing

### Cloud-Specific Tools
- **AWS CLI** + **Session Manager Plugin** (for AWS scripts)
- **Google Cloud SDK** (for GCP scripts)
- **GitHub CLI** (for repository automation)

### Optional Tools
- **Docker** - Containerization
- **tmux** - Terminal multiplexer
- **htop** - System monitoring

## 🛠️ Configuration

### Environment Files
Scripts will look for and create:
- `.env.staging.example`
- `.env.production.example`
- `ecosystem.config.js`
- `.github/workflows/deploy.yml`

### Script Locations
All automation scripts expect to be run from the project root directory:
```bash
# Correct usage
cd /path/to/vvg-template
./docs/vvg-master-automation.sh my-project staging aws

# Incorrect usage (will fail)
cd docs/
./vvg-master-automation.sh my-project staging aws
```

## 🔍 Troubleshooting

### Common Issues

**Scripts not executable:**
```bash
chmod +x docs/*.sh
```

**Missing dependencies:**
```bash
# Install required tools
npm install -g pm2 pnpm
```

**AWS authentication:**
```bash
aws configure
aws sts get-caller-identity
```

**GitHub authentication:**
```bash
gh auth login
gh auth status
```

### Log Files
All scripts generate detailed log files:
- `vvg-automation-*.log` - Master automation logs
- `aws-tunnel-report-*.txt` - AWS tunnel session reports
- `github-repo-setup-*.txt` - Repository creation reports
- `remote-dev-setup-*.txt` - Remote development setup reports
- `gcp-dev-setup-*.txt` - GCP development setup reports

## 📊 Monitoring & Validation

### Health Checks
Scripts include comprehensive validation:
- Pre-flight checks
- Deployment validation
- Smoke testing (60+ test cases)
- Performance monitoring

### Success Metrics
- Build success rate
- Test pass rate
- Deployment time
- Infrastructure availability
- Application response time

## 🤝 Contributing

### Adding New Scripts
1. Create script in `docs/` directory
2. Make executable: `chmod +x docs/new-script.sh`
3. Add documentation to this README
4. Update master automation if needed

### Script Standards
- Use bash with `set -e`
- Include colored output for clarity
- Provide comprehensive error handling
- Generate detailed reports
- Follow VVG naming conventions

## 📞 Support

- **Documentation Issues:** Update this README
- **Script Bugs:** Check log files and error messages
- **Feature Requests:** Contact VVG development team
- **Infrastructure Issues:** Verify cloud provider configuration

---

🤖 **VVG Template Automation Suite**  
⚡ **Maximum Efficiency, Minimum Effort**  
🎯 **Perfect Foundation for ALL Applications**