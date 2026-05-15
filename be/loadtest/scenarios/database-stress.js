import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { BASE_URL, TEST_USER, HEADERS, authHeaders, LOAD_STAGES } from '../config.js';

/**
 * Database stress test
 * Tests query performance and index effectiveness under load
 */

const dbQueryDuration = new Trend('db_query_duration');
const paginationDuration = new Trend('pagination_duration');
const searchDuration = new Trend('search_duration');
const dbErrors = new Rate('db_error_rate');

export const options = {
  stages: LOAD_STAGES[__ENV.LOAD_PROFILE || 'stress'],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
    db_query_duration: ['p(95)<500'],
    search_duration: ['p(95)<800'],
    db_error_rate: ['rate<0.02'],
  },
  tags: { scenario: 'database-stress' },
};

export default function () {
  // === Heavy Pagination (forces DB to scan) ===
  group('DB - Deep Pagination', () => {
    const deepPages = [1, 5, 10, 20, 50];
    const page = deepPages[Math.floor(Math.random() * deepPages.length)];

    const res = http.get(
      `${BASE_URL}/api/v1/products?page=${page}&per_page=50`,
      { headers: HEADERS, tags: { name: 'GET /products deep-page' } },
    );

    paginationDuration.add(res.timings.duration);

    const success = check(res, {
      'pagination status 200': (r) => r.status === 200,
      'pagination has data': (r) => r.json().success === true,
      'pagination time < 500ms': (r) => r.timings.duration < 500,
    });
    dbErrors.add(!success);
  });

  sleep(0.5);

  // === Search Queries (tests text search / ILIKE performance) ===
  group('DB - Search Queries', () => {
    const queries = [
      'bao hiem suc khoe',
      'bao hiem xe',
      'bao hiem nha',
      'tai nan',
      'du lich',
      'gia dinh',
      'doanh nghiep',
      'huu tri',
    ];
    const query = queries[Math.floor(Math.random() * queries.length)];

    const res = http.get(
      `${BASE_URL}/api/v1/products?search=${encodeURIComponent(query)}&page=1&per_page=20`,
      { headers: HEADERS, tags: { name: 'GET /products search' } },
    );

    searchDuration.add(res.timings.duration);

    const success = check(res, {
      'search status 200': (r) => r.status === 200,
      'search time < 800ms': (r) => r.timings.duration < 800,
    });
    dbErrors.add(!success);
  });

  sleep(0.5);

  // === Multiple Filter Combinations ===
  group('DB - Filtered Queries', () => {
    const statuses = ['active', 'draft', 'suspended'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const res = http.get(
      `${BASE_URL}/api/v1/products?status=${status}&page=1&per_page=20`,
      { headers: HEADERS, tags: { name: 'GET /products filtered' } },
    );

    dbQueryDuration.add(res.timings.duration);

    check(res, {
      'filter status 200': (r) => r.status === 200,
      'filter time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  sleep(0.5);

  // === Concurrent Category + Insurer Queries ===
  group('DB - Concurrent Lookups', () => {
    const responses = http.batch([
      ['GET', `${BASE_URL}/api/v1/products/categories`, null, { headers: HEADERS, tags: { name: 'GET /categories batch' } }],
      ['GET', `${BASE_URL}/api/v1/products/insurers`, null, { headers: HEADERS, tags: { name: 'GET /insurers batch' } }],
      ['GET', `${BASE_URL}/api/v1/products?page=1&per_page=10`, null, { headers: HEADERS, tags: { name: 'GET /products batch' } }],
    ]);

    responses.forEach((res, i) => {
      dbQueryDuration.add(res.timings.duration);
      check(res, {
        [`batch[${i}] status 200`]: (r) => r.status === 200,
      });
    });
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'loadtest/results/database-stress-summary.json': JSON.stringify(data, null, 2),
  };
}
