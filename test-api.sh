#!/bin/bash
API_BASE="http://localhost:5000/api/v1"
echo "======================================"
echo "HR-LeaveFlow API Test Suite"
echo "======================================"
echo ""

# Test 1: Health Check
echo "1. Testing API Health..."
curl -s $API_BASE/ | head -c 100
echo ""
echo ""

# Test 2: Auth endpoint exists
echo "2. Testing Auth Endpoint..."
curl -s -X POST $API_BASE/auth/login -H "Content-Type: application/json" -d '{}' | head -c 100
echo ""
echo ""

# Test 3: Check new routes are registered
echo "3. Testing Routes Registration..."
echo "   - Checking /leaves endpoint..."
curl -s $API_BASE/leaves | head -c 50
echo ""
echo "   - Checking /workflows endpoint..."
curl -s $API_BASE/workflows | head -c 50
echo ""
echo ""

echo "======================================"
echo "✅ Basic API tests completed"
echo "======================================"
