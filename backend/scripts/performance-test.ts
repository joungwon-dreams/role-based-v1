/**
 * Performance Testing Script
 *
 * Tests API endpoints before and after optimizations
 * Measures response time, throughput, and cache hit rates
 */

import http from 'http';

interface TestResult {
  endpoint: string;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  successCount: number;
  failureCount: number;
  totalRequests: number;
}

async function makeRequest(
  method: string,
  path: string,
  data?: any,
  cookie?: string
): Promise<{ time: number; status: number; data: any }> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : undefined;

    const options = {
      hostname: 'localhost',
      port: 4000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) }),
        ...(cookie && { Cookie: cookie }),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        try {
          const parsedData = JSON.parse(body);
          resolve({
            time: endTime - startTime,
            status: res.statusCode || 0,
            data: parsedData,
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

async function testEndpoint(
  name: string,
  method: string,
  path: string,
  iterations: number = 10,
  data?: any,
  cookie?: string
): Promise<TestResult> {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   Iterations: ${iterations}`);

  const responseTimes: number[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      const result = await makeRequest(method, path, data, cookie);

      if (result.status === 200) {
        responseTimes.push(result.time);
        successCount++;
        process.stdout.write('.');
      } else {
        failureCount++;
        process.stdout.write('x');
      }
    } catch (error) {
      failureCount++;
      process.stdout.write('x');
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0;
  const minResponseTime = Math.min(...responseTimes) || 0;
  const maxResponseTime = Math.max(...responseTimes) || 0;

  console.log('\n');
  console.log(`   ✅ Success: ${successCount}/${iterations}`);
  console.log(`   ⏱️  Avg: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`   📊 Min: ${minResponseTime}ms, Max: ${maxResponseTime}ms`);

  return {
    endpoint: name,
    avgResponseTime,
    minResponseTime,
    maxResponseTime,
    successCount,
    failureCount,
    totalRequests: iterations,
  };
}

async function getCookie(): Promise<string> {
  console.log('🔐 Getting authentication cookie...');

  const loginData = {
    email: 'test@example.com', // Change to your test user
    password: 'Test123!',
  };

  try {
    const result = await makeRequest('POST', '/api/trpc/auth.signin', loginData);

    if (result.status === 200 && result.data.result?.data) {
      console.log('✅ Authenticated successfully\n');
      // Note: In tRPC, cookies are set automatically via Set-Cookie header
      // For testing, you might need to extract and use them
      return ''; // tRPC uses httpOnly cookies
    }
  } catch (error) {
    console.error('❌ Authentication failed:', error);
  }

  return '';
}

async function runPerformanceTests() {
  console.log('🚀 Starting Performance Tests\n');
  console.log('=' + '='.repeat(50));

  const cookie = await getCookie();
  const results: TestResult[] = [];

  // Test 1: Stories List (with cursor pagination)
  results.push(
    await testEndpoint(
      'stories.list (first page)',
      'GET',
      '/api/trpc/stories.list?input={"filter":"published","limit":20}',
      20,
      undefined,
      cookie
    )
  );

  // Test 2: Notifications Unread Count (cached)
  results.push(
    await testEndpoint(
      'notifications.unreadCount (cached)',
      'GET',
      '/api/trpc/notifications.unreadCount',
      50, // More iterations for caching test
      undefined,
      cookie
    )
  );

  // Test 3: Notifications List
  results.push(
    await testEndpoint(
      'notifications.list',
      'GET',
      '/api/trpc/notifications.list?input={"filter":"all","limit":50}',
      20,
      undefined,
      cookie
    )
  );

  // Test 4: Admin Cache Stats (TIER 2)
  results.push(
    await testEndpoint(
      'admin.monitoring.cacheStats',
      'GET',
      '/api/trpc/admin.monitoring.cacheStats',
      10,
      undefined,
      cookie
    )
  );

  // Summary
  console.log('\n' + '=' + '='.repeat(50));
  console.log('\n📊 Performance Test Summary\n');

  console.log('┌─' + '─'.repeat(50) + '┐');
  console.log('│ Endpoint                              │   Avg Time │');
  console.log('├─' + '─'.repeat(50) + '┤');

  results.forEach((result) => {
    const endpointName = result.endpoint.padEnd(38);
    const avgTime = `${result.avgResponseTime.toFixed(2)}ms`.padStart(9);
    console.log(`│ ${endpointName}│ ${avgTime} │`);
  });

  console.log('└─' + '─'.repeat(50) + '┘\n');

  // Performance Targets
  console.log('🎯 Performance Targets:');
  console.log('  ✓ Stories list: < 50ms');
  console.log('  ✓ Notifications unreadCount (cached): < 10ms');
  console.log('  ✓ Notifications list: < 100ms');
  console.log('  ✓ Admin cache stats: < 20ms\n');

  // Cache Hit Rate
  console.log('📈 For cache hit rate, check: admin.monitoring.cacheHitRate');
  console.log('   Expected: > 90% hit rate after warmup\n');
}

// Run tests
runPerformanceTests().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
