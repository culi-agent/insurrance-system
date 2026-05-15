import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { BASE_URL, TEST_USER, HEADERS, authHeaders, THRESHOLDS, LOAD_STAGES } from '../config.js';

// Custom metrics
const loginDuration = new Trend('auth_login_duration');
const refreshDuration = new Trend('auth_refresh_duration');
const profileDuration = new Trend('auth_profile_duration');
const authErrors = new Rate('auth_error_rate');
const successfulLogins = new Counter('successful_logins');

export const options = {
  stages: LOAD_STAGES[__ENV.LOAD_PROFILE || 'load'],
  thresholds: {
    http_req_duration: THRESHOLDS.http_req_duration,
    http_req_failed: THRESHOLDS.http_req_failed,
    auth_login_duration: ['p(95)<300'],
    auth_refresh_duration: ['p(95)<200'],
    auth_error_rate: ['rate<0.05'],
  },
  tags: { scenario: 'auth-flow' },
};

export default function () {
  let accessToken = null;
  let refreshToken = null;

  // === Login ===
  group('Auth - Login', () => {
    const loginPayload = JSON.stringify({
      email_or_phone: TEST_USER.email,
      password: TEST_USER.password,
      remember_me: false,
    });

    const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, {
      headers: HEADERS,
      tags: { name: 'POST /auth/login' },
    });

    loginDuration.add(loginRes.timings.duration);

    const loginSuccess = check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'login returns access_token': (r) => {
        const body = r.json();
        return body.data && body.data.access_token;
      },
      'login returns refresh_token': (r) => {
        const body = r.json();
        return body.data && body.data.refresh_token;
      },
      'login response time < 300ms': (r) => r.timings.duration < 300,
    });

    if (loginSuccess) {
      const body = loginRes.json();
      accessToken = body.data.access_token;
      refreshToken = body.data.refresh_token;
      successfulLogins.add(1);
    }
    authErrors.add(!loginSuccess);
  });

  sleep(1);

  // === Get Profile ===
  if (accessToken) {
    group('Auth - Get Profile', () => {
      const profileRes = http.get(`${BASE_URL}/api/v1/auth/profile`, {
        headers: authHeaders(accessToken),
        tags: { name: 'GET /auth/profile' },
      });

      profileDuration.add(profileRes.timings.duration);

      const profileSuccess = check(profileRes, {
        'profile status is 200': (r) => r.status === 200,
        'profile has user data': (r) => {
          const body = r.json();
          return body.data && body.data.email;
        },
        'profile response time < 200ms': (r) => r.timings.duration < 200,
      });

      authErrors.add(!profileSuccess);
    });

    sleep(0.5);
  }

  // === Refresh Token ===
  if (refreshToken) {
    group('Auth - Refresh Token', () => {
      const refreshPayload = JSON.stringify({
        refresh_token: refreshToken,
      });

      const refreshRes = http.post(`${BASE_URL}/api/v1/auth/refresh-token`, refreshPayload, {
        headers: HEADERS,
        tags: { name: 'POST /auth/refresh-token' },
      });

      refreshDuration.add(refreshRes.timings.duration);

      const refreshSuccess = check(refreshRes, {
        'refresh status is 200': (r) => r.status === 200,
        'refresh returns new tokens': (r) => {
          const body = r.json();
          return body.data && body.data.access_token && body.data.refresh_token;
        },
        'refresh response time < 200ms': (r) => r.timings.duration < 200,
      });

      if (refreshSuccess) {
        const body = refreshRes.json();
        accessToken = body.data.access_token;
      }
      authErrors.add(!refreshSuccess);
    });

    sleep(0.5);
  }

  // === Logout ===
  if (accessToken) {
    group('Auth - Logout', () => {
      const logoutRes = http.post(`${BASE_URL}/api/v1/auth/logout`, '{}', {
        headers: authHeaders(accessToken),
        tags: { name: 'POST /auth/logout' },
      });

      check(logoutRes, {
        'logout status is 200': (r) => r.status === 200,
        'logout response time < 200ms': (r) => r.timings.duration < 200,
      });
    });
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    'loadtest/results/auth-flow-summary.json': JSON.stringify(data, null, 2),
  };
}
