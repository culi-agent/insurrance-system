/**
 * Load Test Configuration
 * Shared config for all k6 test scenarios
 */

// Base URL from environment or default
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test credentials
export const TEST_USER = {
  email: __ENV.TEST_EMAIL || 'loadtest@example.com',
  phone: __ENV.TEST_PHONE || '+84900000001',
  password: __ENV.TEST_PASSWORD || 'LoadTest1!',
};

export const ADMIN_USER = {
  email: __ENV.ADMIN_EMAIL || 'admin@insurance-system.vn',
  password: __ENV.ADMIN_PASSWORD || 'Admin123!',
};

// Performance thresholds
export const THRESHOLDS = {
  // HTTP request duration (response time)
  http_req_duration: [
    'p(50)<200',   // 50% of requests should be below 200ms
    'p(95)<500',   // 95% of requests should be below 500ms
    'p(99)<1000',  // 99% of requests should be below 1000ms
    'max<3000',    // No request should exceed 3 seconds
  ],
  // HTTP request failure rate
  http_req_failed: ['rate<0.01'], // Less than 1% error rate
  // Iteration duration
  iteration_duration: ['p(95)<3000'],
  // Custom metrics
  'auth_login_duration': ['p(95)<300'],
  'auth_refresh_duration': ['p(95)<200'],
  'products_list_duration': ['p(95)<200'],
  'products_detail_duration': ['p(95)<150'],
  'quotation_create_duration': ['p(95)<500'],
};

// Load stages for ramp-up testing
export const LOAD_STAGES = {
  // Smoke test: verify system works
  smoke: [
    { duration: '30s', target: 1 },
  ],
  // Load test: normal traffic
  load: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 10 },   // Stay at 10 users
    { duration: '1m', target: 30 },   // Ramp up to 30 users
    { duration: '3m', target: 30 },   // Stay at 30 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  // Stress test: find breaking point
  stress: [
    { duration: '1m', target: 20 },
    { duration: '2m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 150 },
    { duration: '2m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  // Spike test: sudden traffic burst
  spike: [
    { duration: '30s', target: 5 },
    { duration: '10s', target: 100 },  // Sudden spike
    { duration: '1m', target: 100 },   // Hold spike
    { duration: '10s', target: 5 },    // Drop back
    { duration: '1m', target: 5 },     // Recovery
    { duration: '30s', target: 0 },
  ],
  // Soak test: extended duration
  soak: [
    { duration: '2m', target: 20 },
    { duration: '30m', target: 20 },   // Sustained load
    { duration: '2m', target: 0 },
  ],
};

// Common request headers
export const HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export function authHeaders(accessToken) {
  return {
    ...HEADERS,
    Authorization: `Bearer ${accessToken}`,
  };
}
