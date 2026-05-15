import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { BASE_URL, TEST_USER, ADMIN_USER, HEADERS, authHeaders, THRESHOLDS, LOAD_STAGES } from '../config.js';

/**
 * Main load test scenario - combines all critical paths
 * Simulates realistic user behavior across the platform
 */

// Custom metrics
const loginDuration = new Trend('auth_login_duration');
const refreshDuration = new Trend('auth_refresh_duration');
const productsListDuration = new Trend('products_list_duration');
const productsDetailDuration = new Trend('products_detail_duration');
const quotationCreateDuration = new Trend('quotation_create_duration');
const overallErrors = new Rate('overall_error_rate');
const totalRequests = new Counter('total_requests');

export const options = {
  scenarios: {
    // Scenario 1: Regular users browsing products
    browse_products: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 20 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      tags: { scenario: 'browse' },
      exec: 'browseProducts',
    },
    // Scenario 2: Users logging in and managing profile
    auth_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '3m', target: 10 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      tags: { scenario: 'auth' },
      exec: 'authFlow',
    },
    // Scenario 3: Health check monitoring
    health_monitor: {
      executor: 'constant-arrival-rate',
      rate: 2,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 2,
      tags: { scenario: 'health' },
      exec: 'healthCheck',
    },
  },
  thresholds: {
    http_req_duration: THRESHOLDS.http_req_duration,
    http_req_failed: THRESHOLDS.http_req_failed,
    auth_login_duration: ['p(95)<300'],
    products_list_duration: ['p(95)<200'],
    overall_error_rate: ['rate<0.01'],
  },
};

// === Scenario: Browse Products ===
export function browseProducts() {
  group('Browse - Product List', () => {
    const page = Math.floor(Math.random() * 3) + 1;
    const res = http.get(`${BASE_URL}/api/v1/products?page=${page}&per_page=20`, {
      headers: HEADERS,
      tags: { name: 'GET /products' },
    });

    productsListDuration.add(res.timings.duration);
    totalRequests.add(1);

    const success = check(res, {
      'products 200': (r) => r.status === 200,
      'has data': (r) => r.json().success === true,
    });
    overallErrors.add(!success);
  });

  sleep(Math.random() * 2 + 1);

  group('Browse - Categories', () => {
    const res = http.get(`${BASE_URL}/api/v1/products/categories`, {
      headers: HEADERS,
      tags: { name: 'GET /categories' },
    });
    totalRequests.add(1);

    check(res, { 'categories 200': (r) => r.status === 200 });
  });

  sleep(Math.random() * 2 + 1);

  group('Browse - Product Detail', () => {
    // First get list to find a product
    const listRes = http.get(`${BASE_URL}/api/v1/products?page=1&per_page=5`, {
      headers: HEADERS,
    });

    if (listRes.status === 200) {
      const products = listRes.json().data;
      if (products && products.length > 0) {
        const product = products[Math.floor(Math.random() * products.length)];
        const detailRes = http.get(`${BASE_URL}/api/v1/products/${product.slug}`, {
          headers: HEADERS,
          tags: { name: 'GET /products/:slug' },
        });

        productsDetailDuration.add(detailRes.timings.duration);
        totalRequests.add(1);

        const success = check(detailRes, {
          'detail 200': (r) => r.status === 200,
          'has product name': (r) => r.json().data && r.json().data.name,
        });
        overallErrors.add(!success);
      }
    }
  });

  sleep(Math.random() * 3 + 2);
}

// === Scenario: Auth Flow ===
export function authFlow() {
  let accessToken = null;
  let refreshToken = null;

  group('Auth - Login', () => {
    const res = http.post(
      `${BASE_URL}/api/v1/auth/login`,
      JSON.stringify({
        email_or_phone: TEST_USER.email,
        password: TEST_USER.password,
      }),
      { headers: HEADERS, tags: { name: 'POST /auth/login' } },
    );

    loginDuration.add(res.timings.duration);
    totalRequests.add(1);

    const success = check(res, {
      'login 200': (r) => r.status === 200,
      'has tokens': (r) => r.json().data && r.json().data.access_token,
    });

    if (success) {
      accessToken = res.json().data.access_token;
      refreshToken = res.json().data.refresh_token;
    }
    overallErrors.add(!success);
  });

  sleep(2);

  if (accessToken) {
    group('Auth - Profile', () => {
      const res = http.get(`${BASE_URL}/api/v1/auth/profile`, {
        headers: authHeaders(accessToken),
        tags: { name: 'GET /auth/profile' },
      });
      totalRequests.add(1);

      check(res, {
        'profile 200': (r) => r.status === 200,
        'has email': (r) => r.json().data && r.json().data.email,
      });
    });

    sleep(3);

    group('Auth - Refresh', () => {
      const res = http.post(
        `${BASE_URL}/api/v1/auth/refresh-token`,
        JSON.stringify({ refresh_token: refreshToken }),
        { headers: HEADERS, tags: { name: 'POST /auth/refresh-token' } },
      );

      refreshDuration.add(res.timings.duration);
      totalRequests.add(1);

      const success = check(res, {
        'refresh 200': (r) => r.status === 200,
      });

      if (success) {
        accessToken = res.json().data.access_token;
      }
      overallErrors.add(!success);
    });

    sleep(2);

    group('Auth - Logout', () => {
      const res = http.post(`${BASE_URL}/api/v1/auth/logout`, '{}', {
        headers: authHeaders(accessToken),
        tags: { name: 'POST /auth/logout' },
      });
      totalRequests.add(1);

      check(res, { 'logout 200': (r) => r.status === 200 });
    });
  }

  sleep(5);
}

// === Scenario: Health Check ===
export function healthCheck() {
  const res = http.get(`${BASE_URL}/health`, {
    tags: { name: 'GET /health' },
  });
  totalRequests.add(1);

  check(res, {
    'health 200': (r) => r.status === 200,
    'health < 100ms': (r) => r.timings.duration < 100,
    'status ok': (r) => r.json().status === 'ok',
  });
}

export function handleSummary(data) {
  // Generate comprehensive summary
  const summary = {
    timestamp: new Date().toISOString(),
    metrics: {
      total_requests: data.metrics.total_requests ? data.metrics.total_requests.values.count : 0,
      http_reqs: data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0,
      http_req_duration: data.metrics.http_req_duration ? {
        avg: data.metrics.http_req_duration.values.avg,
        p50: data.metrics.http_req_duration.values['p(50)'],
        p90: data.metrics.http_req_duration.values['p(90)'],
        p95: data.metrics.http_req_duration.values['p(95)'],
        p99: data.metrics.http_req_duration.values['p(99)'],
        max: data.metrics.http_req_duration.values.max,
      } : null,
      error_rate: data.metrics.http_req_failed ? data.metrics.http_req_failed.values.rate : 0,
      throughput: data.metrics.http_reqs ? data.metrics.http_reqs.values.rate : 0,
    },
    thresholds: data.thresholds || {},
  };

  return {
    'loadtest/results/main-summary.json': JSON.stringify(summary, null, 2),
    stdout: generateTextReport(summary),
  };
}

function generateTextReport(summary) {
  const m = summary.metrics;
  const dur = m.http_req_duration || {};
  
  return `
╔══════════════════════════════════════════════════════════╗
║          INSURANCE SYSTEM - LOAD TEST RESULTS           ║
╠══════════════════════════════════════════════════════════╣
║ Timestamp: ${summary.timestamp}
║ Total Requests: ${m.http_reqs}
║ Throughput: ${m.throughput ? m.throughput.toFixed(2) : 'N/A'} req/s
║ Error Rate: ${(m.error_rate * 100).toFixed(2)}%
╠══════════════════════════════════════════════════════════╣
║ Response Time (ms):
║   Average: ${dur.avg ? dur.avg.toFixed(2) : 'N/A'}
║   P50:     ${dur.p50 ? dur.p50.toFixed(2) : 'N/A'}
║   P90:     ${dur.p90 ? dur.p90.toFixed(2) : 'N/A'}
║   P95:     ${dur.p95 ? dur.p95.toFixed(2) : 'N/A'}
║   P99:     ${dur.p99 ? dur.p99.toFixed(2) : 'N/A'}
║   Max:     ${dur.max ? dur.max.toFixed(2) : 'N/A'}
╠══════════════════════════════════════════════════════════╣
║ Thresholds: ${Object.keys(summary.thresholds).length > 0 ? 'See details' : 'N/A'}
╚══════════════════════════════════════════════════════════╝
`;
}
