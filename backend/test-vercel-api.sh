#!/bin/bash

echo "🧪 Testing Vercel API Endpoints"
echo "================================"
echo ""

BASE_URL="https://role-based-v1.vercel.app"

# 1. Health Check
echo "1️⃣ Testing Health Check..."
curl -s "$BASE_URL/api/health" | jq .
echo ""

# 2. tRPC Health (if exists)
echo "2️⃣ Testing tRPC..."
timeout 5s curl -X POST "$BASE_URL/api/trpc/auth.login" \
  -H "Content-Type: application/json" \
  -d '{"json":{"email":"admin@example.com","password":"Admin@123456"}}' \
  2>/dev/null || echo "⏱️ Request timed out or failed"

echo ""
echo "✅ Test complete"
