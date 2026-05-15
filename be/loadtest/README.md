# Performance & Load Testing

## Overview

Load testing suite using [k6](https://k6.io/) for the Insurance System API.

## Prerequisites

Install k6:
```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# Docker
docker pull grafana/k6
```

## Running Tests

```bash
# Run all scenarios
k6 run loadtest/scenarios/main.js

# Run specific scenario
k6 run loadtest/scenarios/auth-flow.js

# Run with custom options
k6 run --vus 50 --duration 2m loadtest/scenarios/main.js

# Run with environment variables
k6 run -e BASE_URL=http://localhost:3000 -e TEST_EMAIL=test@example.com loadtest/scenarios/main.js

# Output to JSON for analysis
k6 run --out json=loadtest/results/result.json loadtest/scenarios/main.js

# Output to InfluxDB (for Grafana dashboards)
k6 run --out influxdb=http://localhost:8086/k6 loadtest/scenarios/main.js
```

## Test Scenarios

| Scenario | Description | Target |
|----------|-------------|--------|
| auth-flow | Login, refresh token, profile | p95 < 200ms |
| products | Product listing, search, details | p95 < 150ms |
| quotations | Create & retrieve quotations | p95 < 500ms |
| admin | Admin CRUD operations | p95 < 300ms |
| main | Combined all scenarios | Error rate < 1% |

## Performance Targets

- **Response Time (p95)**: < 500ms for all endpoints
- **Response Time (p99)**: < 1000ms
- **Throughput**: > 100 req/s sustained
- **Error Rate**: < 1% under normal load
- **Availability**: 99.9% uptime under load

## Results

Results are saved in `loadtest/results/` directory after each run.
