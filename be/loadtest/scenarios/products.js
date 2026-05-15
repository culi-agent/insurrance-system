import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { BASE_URL, HEADERS, THRESHOLDS, LOAD_STAGES } from '../config.js';

// Custom metrics
const listDuration = new Trend('products_list_duration');
const detailDuration = new Trend('products_detail_duration');
const categoryDuration = new Trend('categories_list_duration');
const searchDuration = new Trend('products_search_duration');
const productErrors = new Rate('products_error_rate');

export const options = {
  stages: LOAD_STAGES[__ENV.LOAD_PROFILE || 'load'],
  thresholds: {
    http_req_duration: THRESHOLDS.http_req_duration,
    http_req_failed: THRESHOLDS.http_req_failed,
    products_list_duration: ['p(95)<200'],
    products_detail_duration: ['p(95)<150'],
    categories_list_duration: ['p(95)<150'],
    products_search_duration: ['p(95)<300'],
    products_error_rate: ['rate<0.01'],
  },
  tags: { scenario: 'products' },
};

export default function () {
  let productSlug = null;

  // === List Products (paginated) ===
  group('Products - List', () => {
    const page = Math.floor(Math.random() * 5) + 1;
    const listRes = http.get(
      `${BASE_URL}/api/v1/products?page=${page}&per_page=20`,
      {
        headers: HEADERS,
        tags: { name: 'GET /products' },
      },
    );

    listDuration.add(listRes.timings.duration);

    const listSuccess = check(listRes, {
      'products list status 200': (r) => r.status === 200,
      'products list has data array': (r) => {
        const body = r.json();
        return body.success === true && Array.isArray(body.data);
      },
      'products list has pagination': (r) => {
        const body = r.json();
        return body.pagination && typeof body.pagination.total === 'number';
      },
      'products list response time < 200ms': (r) => r.timings.duration < 200,
    });

    // Get a product slug for detail test
    if (listSuccess) {
      const body = listRes.json();
      if (body.data && body.data.length > 0) {
        const randomIndex = Math.floor(Math.random() * body.data.length);
        productSlug = body.data[randomIndex].slug;
      }
    }
    productErrors.add(!listSuccess);
  });

  sleep(0.5);

  // === Get Product Detail ===
  if (productSlug) {
    group('Products - Detail', () => {
      const detailRes = http.get(`${BASE_URL}/api/v1/products/${productSlug}`, {
        headers: HEADERS,
        tags: { name: 'GET /products/:slug' },
      });

      detailDuration.add(detailRes.timings.duration);

      const detailSuccess = check(detailRes, {
        'product detail status 200': (r) => r.status === 200,
        'product detail has data': (r) => {
          const body = r.json();
          return body.data && body.data.id;
        },
        'product detail has name': (r) => {
          const body = r.json();
          return body.data && body.data.name;
        },
        'product detail response time < 150ms': (r) => r.timings.duration < 150,
      });

      productErrors.add(!detailSuccess);
    });

    sleep(0.5);
  }

  // === List Categories ===
  group('Products - Categories', () => {
    const catRes = http.get(`${BASE_URL}/api/v1/products/categories`, {
      headers: HEADERS,
      tags: { name: 'GET /products/categories' },
    });

    categoryDuration.add(catRes.timings.duration);

    const catSuccess = check(catRes, {
      'categories status 200': (r) => r.status === 200,
      'categories has data': (r) => {
        const body = r.json();
        return body.success === true && Array.isArray(body.data);
      },
      'categories response time < 150ms': (r) => r.timings.duration < 150,
    });

    productErrors.add(!catSuccess);
  });

  sleep(0.5);

  // === List Insurers ===
  group('Products - Insurers', () => {
    const insurerRes = http.get(`${BASE_URL}/api/v1/products/insurers`, {
      headers: HEADERS,
      tags: { name: 'GET /products/insurers' },
    });

    check(insurerRes, {
      'insurers status 200': (r) => r.status === 200,
      'insurers response time < 150ms': (r) => r.timings.duration < 150,
    });
  });

  sleep(0.5);

  // === Search Products ===
  group('Products - Search', () => {
    const searchTerms = ['bao hiem', 'suc khoe', 'xe', 'nha', 'du lich'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    const searchRes = http.get(
      `${BASE_URL}/api/v1/products?search=${encodeURIComponent(term)}&page=1&per_page=10`,
      {
        headers: HEADERS,
        tags: { name: 'GET /products?search=' },
      },
    );

    searchDuration.add(searchRes.timings.duration);

    const searchSuccess = check(searchRes, {
      'search status 200': (r) => r.status === 200,
      'search returns data': (r) => {
        const body = r.json();
        return body.success === true;
      },
      'search response time < 300ms': (r) => r.timings.duration < 300,
    });

    productErrors.add(!searchSuccess);
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'loadtest/results/products-summary.json': JSON.stringify(data, null, 2),
  };
}
