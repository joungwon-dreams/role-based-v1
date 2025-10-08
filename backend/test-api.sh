#!/bin/bash

BASE_URL="http://localhost:4000/trpc"

echo "Testing tRPC API..."
echo ""

# Test 1: Signup
echo "1. Testing signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth.signup" \
  -H "Content-Type: application/json" \
  -d '{"0":{"json":{"email":"test@example.com","password":"Test@123456","name":"Test User"}}}')

echo "$SIGNUP_RESPONSE" | jq
echo ""

# Test 2: Signin with admin credentials
echo "2. Testing signin with admin..."
SIGNIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth.signin" \
  -H "Content-Type: application/json" \
  -d '{"0":{"json":{"email":"admin@example.com","password":"Admin@123456"}}}')

echo "$SIGNIN_RESPONSE" | jq

# Extract access token
ACCESS_TOKEN=$(echo "$SIGNIN_RESPONSE" | jq -r '.[0].result.data.json.accessToken')
echo ""
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo ""

# Test 3: Get current user (me)
echo "3. Testing me endpoint..."
ME_RESPONSE=$(curl -s "${BASE_URL}/auth.me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$ME_RESPONSE" | jq
echo ""

# Test 4: List users (admin only)
echo "4. Testing list users (admin only)..."
LIST_RESPONSE=$(curl -s "${BASE_URL}/user.list?input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A10%2C%22offset%22%3A0%7D%7D%7D" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$LIST_RESPONSE" | jq
echo ""

# Test 5: List roles (admin only)
echo "5. Testing list roles..."
ROLES_RESPONSE=$(curl -s "${BASE_URL}/role.list" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$ROLES_RESPONSE" | jq
echo ""

# Test 6: List permissions (admin only)
echo "6. Testing list permissions..."
PERMS_RESPONSE=$(curl -s "${BASE_URL}/permission.list" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$PERMS_RESPONSE" | jq
echo ""

echo "All tests completed!"
