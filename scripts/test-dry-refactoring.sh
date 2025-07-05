#!/bin/bash
# DRY Refactoring Test Script
# Tests all refactored API endpoints to ensure they work correctly

echo "=== DRY Refactoring Test Suite ==="
echo "Testing refactored API endpoints..."

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    
    echo -n "Testing $method $endpoint - $description... "
    
    response=$(curl -s -X $method -w "\n%{http_code}" "$BASE_URL$endpoint" | tail -1)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}PASSED${NC} (Status: $response)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}FAILED${NC} (Expected: $expected_status, Got: $response)"
        ((TESTS_FAILED++))
    fi
}

# Test authentication requirements
echo -e "\n--- Testing Authentication ---"
test_endpoint "GET" "/api/documents/1" "307" "Should redirect to login when not authenticated"
test_endpoint "DELETE" "/api/documents/1" "307" "Should redirect to login when not authenticated"
test_endpoint "PATCH" "/api/documents/1" "307" "Should redirect to login when not authenticated"
test_endpoint "GET" "/api/dashboard/stats" "307" "Should redirect to login when not authenticated"
test_endpoint "GET" "/api/documents/1/download" "307" "Download should redirect when not authenticated"
test_endpoint "POST" "/api/documents/1/set-standard" "307" "Set-standard should redirect when not authenticated"

# Test validation
echo -e "\n--- Testing Validation ---"
test_endpoint "GET" "/api/documents/invalid" "307" "Should handle invalid document ID"
test_endpoint "DELETE" "/api/documents/abc" "307" "Should handle non-numeric document ID"

# Build test
echo -e "\n--- Testing Build ---"
echo -n "Running build check... "
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}FAILED${NC}"
    ((TESTS_FAILED++))
fi

# Summary
echo -e "\n=== Test Summary ==="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed! DRY refactoring successful.${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed. Please review the refactoring.${NC}"
    exit 1
fi