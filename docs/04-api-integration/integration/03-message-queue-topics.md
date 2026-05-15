# Message Queue Topics - Thiết Kế Hàng Đợi Tin Nhắn

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Message Broker | RabbitMQ 3.12+ |
| Protocol | AMQP 0.9.1 |
| Serialization | JSON (UTF-8) |
| Management UI | `https://rabbitmq.insurance-system.vn` |

---

## 1. Tổng quan Architecture

### 1.1. Messaging Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MESSAGE BROKER (RabbitMQ)                         │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      EXCHANGES                                │    │
│  │                                                               │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │    │
│  │  │ policy   │  │ claims   │  │ payment  │  │ customer │   │    │
│  │  │ (topic)  │  │ (topic)  │  │ (topic)  │  │ (topic)  │   │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │    │
│  │       │              │              │              │          │    │
│  └───────┼──────────────┼──────────────┼──────────────┼──────────┘    │
│          │              │              │              │               │
│  ┌───────┼──────────────┼──────────────┼──────────────┼──────────┐    │
│  │       ▼              ▼              ▼              ▼          │    │
│  │                       QUEUES                                  │    │
│  │                                                               │    │
│  │  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │    │
│  │  │ notification   │  │ webhook        │  │ analytics     │  │    │
│  │  │ .policy.*      │  │ .policy.*      │  │ .all          │  │    │
│  │  └────────────────┘  └────────────────┘  └───────────────┘  │    │
│  │  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │    │
│  │  │ policy         │  │ claims         │  │ payment       │  │    │
│  │  │ .renewal       │  │ .processing    │  │ .settlement   │  │    │
│  │  └────────────────┘  └────────────────┘  └───────────────┘  │    │
│  │                                                               │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2. Exchange Types

| Exchange Type | Sử dụng cho | Routing |
|--------------|-------------|---------|
| **Topic** | Domain events | Routing key pattern matching |
| **Direct** | Command/Request | Exact routing key match |
| **Fanout** | Broadcast events | All bound queues |
| **Dead Letter** | Failed messages | After max retries |

---

## 2. Exchanges

### 2.1. Topic Exchanges (Domain Events)

| Exchange Name | Mô tả | Durable | Auto-Delete |
|--------------|--------|---------|-------------|
| `insurance.customer` | Customer domain events | Yes | No |
| `insurance.quotation` | Quotation domain events | Yes | No |
| `insurance.policy` | Policy domain events | Yes | No |
| `insurance.claims` | Claims domain events | Yes | No |
| `insurance.payment` | Payment domain events | Yes | No |
| `insurance.notification` | Notification triggers | Yes | No |

### 2.2. Direct Exchanges (Commands)

| Exchange Name | Mô tả | Durable | Auto-Delete |
|--------------|--------|---------|-------------|
| `insurance.cmd.policy` | Policy commands | Yes | No |
| `insurance.cmd.claims` | Claims processing commands | Yes | No |
| `insurance.cmd.payment` | Payment commands | Yes | No |
| `insurance.cmd.notification` | Notification send commands | Yes | No |
| `insurance.cmd.document` | Document processing commands | Yes | No |

### 2.3. Special Exchanges

| Exchange Name | Type | Mô tả |
|--------------|------|--------|
| `insurance.dlx` | Fanout | Dead Letter Exchange |
| `insurance.retry` | Direct | Retry exchange (delayed) |
| `insurance.audit` | Fanout | Audit log broadcast |

---

## 3. Queues

### 3.1. Policy Service Queues

| Queue Name | Binding Exchange | Routing Key | Consumers | Mô tả |
|-----------|-----------------|-------------|-----------|--------|
| `policy.lifecycle` | `insurance.policy` | `policy.policy.*` | policy-service | Xử lý policy lifecycle |
| `policy.renewal.check` | `insurance.policy` | `policy.premium.due` | renewal-worker | Check & trigger renewals |
| `policy.issuance` | `insurance.cmd.policy` | `issue` | policy-service | Issue new policies |
| `policy.cancellation` | `insurance.cmd.policy` | `cancel` | policy-service | Process cancellations |
| `policy.endorsement` | `insurance.cmd.policy` | `endorse` | policy-service | Process endorsements |

### 3.2. Claims Service Queues

| Queue Name | Binding Exchange | Routing Key | Consumers | Mô tả |
|-----------|-----------------|-------------|-----------|--------|
| `claims.processing` | `insurance.claims` | `claims.claim.*` | claims-service | Main claims processing |
| `claims.assessment` | `insurance.cmd.claims` | `assess` | claims-worker | Auto-assessment |
| `claims.assignment` | `insurance.cmd.claims` | `assign` | claims-service | Auto-assign to handler |
| `claims.settlement` | `insurance.cmd.claims` | `settle` | payment-service | Trigger settlement |
| `claims.fraud.check` | `insurance.claims` | `claims.claim.submitted` | fraud-service | Fraud detection |

### 3.3. Payment Service Queues

| Queue Name | Binding Exchange | Routing Key | Consumers | Mô tả |
|-----------|-----------------|-------------|-----------|--------|
| `payment.processing` | `insurance.payment` | `payment.transaction.*` | payment-service | Transaction processing |
| `payment.reconciliation` | `insurance.cmd.payment` | `reconcile` | reconciliation-worker | Monthly reconciliation |
| `payment.auto-debit` | `insurance.cmd.payment` | `auto_debit` | payment-service | Auto-debit charges |
| `payment.refund` | `insurance.cmd.payment` | `refund` | payment-service | Process refunds |
| `payment.settlement` | `insurance.cmd.payment` | `settle_partner` | settlement-worker | Settle with insurers |

### 3.4. Notification Service Queues

| Queue Name | Binding Exchange | Routing Key | Consumers | Mô tả |
|-----------|-----------------|-------------|-----------|--------|
| `notification.email` | `insurance.cmd.notification` | `email` | email-worker | Send emails |
| `notification.sms` | `insurance.cmd.notification` | `sms` | sms-worker | Send SMS |
| `notification.push` | `insurance.cmd.notification` | `push` | push-worker | Push notifications |
| `notification.inapp` | `insurance.cmd.notification` | `inapp` | notification-service | In-app notifications |
| `notification.events` | `insurance.*` | `#` | notification-service | Listen all events → trigger |

### 3.5. Webhook Service Queues

| Queue Name | Binding Exchange | Routing Key | Consumers | Mô tả |
|-----------|-----------------|-------------|-----------|--------|
| `webhook.delivery` | `insurance.*` | `#` | webhook-service | Deliver webhooks to partners |
| `webhook.retry` | `insurance.retry` | `webhook` | webhook-service | Retry failed deliveries |

### 3.6. Analytics Service Queues

| Queue Name | Binding Exchange | Routing Key | Consumers | Mô tả |
|-----------|-----------------|-------------|-----------|--------|
| `analytics.events` | `insurance.*` | `#` | analytics-service | Collect all events |
| `analytics.metrics` | `insurance.audit` | - | metrics-service | Real-time metrics |

### 3.7. Dead Letter Queues

| Queue Name | Source Queue | TTL | Mô tả |
|-----------|-------------|-----|--------|
| `dlq.policy` | policy.* | 14 days | Failed policy messages |
| `dlq.claims` | claims.* | 14 days | Failed claims messages |
| `dlq.payment` | payment.* | 14 days | Failed payment messages |
| `dlq.notification` | notification.* | 7 days | Failed notifications |
| `dlq.webhook` | webhook.* | 7 days | Failed webhooks |

---

## 4. Routing Keys

### 4.1. Routing Key Convention

```
{domain}.{entity}.{action}[.{sub_action}]
```

**Pattern Matching:**
- `*` matches exactly one word
- `#` matches zero or more words

### 4.2. Full Routing Key List

| Routing Key | Exchange | Mô tả |
|------------|----------|--------|
| `customer.account.created` | insurance.customer | New customer registered |
| `customer.account.updated` | insurance.customer | Profile updated |
| `customer.kyc.completed` | insurance.customer | KYC verified/rejected |
| `customer.kyc.expired` | insurance.customer | KYC document expired |
| `quotation.quote.requested` | insurance.quotation | Quote calculation started |
| `quotation.quote.generated` | insurance.quotation | Quote results ready |
| `quotation.quote.expired` | insurance.quotation | Quote expired (30 days) |
| `quotation.quote.converted` | insurance.quotation | Quote became policy |
| `policy.policy.created` | insurance.policy | New policy issued |
| `policy.policy.activated` | insurance.policy | Policy effective date reached |
| `policy.policy.renewed` | insurance.policy | Policy renewed |
| `policy.policy.cancelled` | insurance.policy | Policy cancelled |
| `policy.policy.lapsed` | insurance.policy | Policy lapsed |
| `policy.policy.endorsed` | insurance.policy | Policy endorsement applied |
| `policy.premium.due` | insurance.policy | Premium payment due |
| `policy.premium.overdue` | insurance.policy | Premium overdue |
| `claims.claim.submitted` | insurance.claims | New claim submitted |
| `claims.claim.assigned` | insurance.claims | Claim assigned to handler |
| `claims.claim.documents_reviewed` | insurance.claims | Documents review complete |
| `claims.claim.info_requested` | insurance.claims | Additional info requested |
| `claims.claim.assessed` | insurance.claims | Assessment completed |
| `claims.claim.decided` | insurance.claims | Decision made |
| `claims.claim.settled` | insurance.claims | Payment settled |
| `claims.claim.closed` | insurance.claims | Claim closed |
| `claims.claim.appealed` | insurance.claims | Customer appealed |
| `payment.transaction.initiated` | insurance.payment | Payment started |
| `payment.transaction.completed` | insurance.payment | Payment successful |
| `payment.transaction.failed` | insurance.payment | Payment failed |
| `payment.refund.initiated` | insurance.payment | Refund started |
| `payment.refund.processed` | insurance.payment | Refund completed |
| `payment.reconciliation.completed` | insurance.payment | Monthly reconciliation done |

---

## 5. Message Format

### 5.1. Message Properties (AMQP)

| Property | Value | Mô tả |
|----------|-------|--------|
| `content_type` | `application/json` | Always JSON |
| `content_encoding` | `utf-8` | Always UTF-8 |
| `delivery_mode` | `2` (persistent) | Survive broker restart |
| `priority` | `0-9` | Message priority |
| `message_id` | UUID v4 | Unique message ID |
| `correlation_id` | UUID | Request correlation |
| `timestamp` | Unix epoch | Message creation time |
| `type` | routing key | Event type |
| `app_id` | service name | Producer service |
| `headers.x-retry-count` | integer | Current retry attempt |
| `headers.x-max-retries` | integer | Max retries (default: 3) |
| `headers.x-original-exchange` | string | For DLQ: original exchange |
| `headers.x-original-routing-key` | string | For DLQ: original routing key |

### 5.2. Message Body

Sử dụng cùng Event Envelope format đã định nghĩa trong [Event Contract](./02-event-contract.md):

```json
{
  "event_id": "uuid",
  "event_type": "policy.policy.created",
  "event_version": "1.0.0",
  "source": "policy-service",
  "timestamp": "2026-05-15T10:30:00.000Z",
  "correlation_id": "uuid",
  "causation_id": "uuid",
  "actor": { "type": "user", "id": "uuid" },
  "data": { ... },
  "metadata": { ... }
}
```

### 5.3. Priority Levels

| Priority | Value | Sử dụng cho | Ví dụ |
|----------|-------|-------------|-------|
| Critical | 9 | Payment, security | Payment completion, fraud alert |
| High | 7 | Policy issuance | Policy created, claim decided |
| Normal | 5 | General events | Profile updated, quote generated |
| Low | 3 | Analytics, logs | Metrics collection |
| Background | 1 | Batch processing | Reconciliation, reports |

---

## 6. Queue Configuration

### 6.1. Standard Queue Arguments

```json
{
  "x-queue-type": "quorum",
  "x-dead-letter-exchange": "insurance.dlx",
  "x-dead-letter-routing-key": "{service}.dlq",
  "x-message-ttl": 86400000,
  "x-max-length": 100000,
  "x-overflow": "reject-publish",
  "x-queue-master-locator": "min-masters"
}
```

### 6.2. Queue Configurations by Type

| Queue Type | Quorum | TTL | Max Length | Prefetch |
|-----------|--------|-----|------------|----------|
| Processing (policy, claims) | Yes | 24h | 100K | 10 |
| Notification (email, sms) | Yes | 12h | 500K | 50 |
| Webhook delivery | Yes | 48h | 200K | 20 |
| Analytics | No (classic) | 6h | 1M | 100 |
| DLQ | Yes | 14 days | 50K | 1 |
| Retry | Yes | Variable | 100K | 5 |

### 6.3. Consumer Configuration

| Setting | Value | Mô tả |
|---------|-------|--------|
| `prefetch_count` | 10-100 | Tùy queue type (xem trên) |
| `auto_ack` | false | Manual ack sau khi xử lý xong |
| `exclusive` | false | Multiple consumers per queue |
| `consumer_timeout` | 30 min | Max processing time |

---

## 7. Retry & Error Handling

### 7.1. Retry Strategy

```
Message fails
    │
    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Retry 1      │────▶│ Retry 2      │────▶│ Retry 3      │
│ Delay: 5s    │     │ Delay: 30s   │     │ Delay: 5min  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼ (all retries failed)
                                           ┌──────────────┐
                                           │ Dead Letter  │
                                           │ Queue (DLQ)  │
                                           └──────────────┘
```

### 7.2. Retry Configuration

| Retry # | Delay | Tổng thời gian |
|---------|-------|----------------|
| 1 | 5 seconds | 5s |
| 2 | 30 seconds | 35s |
| 3 | 5 minutes | 5m 35s |

### 7.3. Delayed Retry Implementation

Sử dụng RabbitMQ Delayed Message Plugin hoặc TTL-based:

```
Original Queue → (nack/reject) → Retry Exchange (with TTL)
                                        │
                                        ▼ (after TTL)
                                  Original Queue (re-delivered)
```

### 7.4. Error Categories

| Category | Retry? | Action |
|----------|--------|--------|
| Transient (timeout, connection) | ✅ Yes | Retry with backoff |
| Business logic error | ❌ No | DLQ + alert |
| Validation error | ❌ No | DLQ + log |
| Infrastructure error | ✅ Yes | Retry + alert if persistent |
| Poison message | ❌ No | DLQ immediately |

---

## 8. Monitoring & Alerting

### 8.1. Key Metrics

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Queue depth | > 1000 messages | > 10000 messages | Scale consumers |
| Consumer lag | > 5 min | > 30 min | Investigate bottleneck |
| Message rate (publish) | - | > 10K/s | Check for loops |
| DLQ depth | > 10 messages | > 100 messages | Manual review |
| Unacked messages | > 100 | > 500 | Consumer stuck |
| Consumer count | < 2 per queue | 0 | Service down |

### 8.2. Health Checks

```
GET /health/rabbitmq
```

Response:
```json
{
  "status": "healthy",
  "connections": 12,
  "channels": 48,
  "queues": {
    "total": 28,
    "messages_ready": 45,
    "messages_unacked": 12
  },
  "node": "rabbit@node1",
  "cluster_size": 3
}
```

### 8.3. Alerting Rules

| Alert | Condition | Severity | Notify |
|-------|-----------|----------|--------|
| Queue backed up | depth > 10K for > 10min | Critical | On-call + Slack |
| DLQ growing | DLQ depth increases > 10/hour | Warning | Team channel |
| Consumer offline | consumer_count = 0 for > 2min | Critical | On-call |
| High reject rate | reject_rate > 5% for > 5min | Warning | Team channel |
| Broker disk low | disk_free < 1GB | Critical | Ops team |

---

## 9. Cluster Configuration

### 9.1. Production Setup

```
┌─────────────────────────────────────────────────────┐
│              RabbitMQ Cluster (3 nodes)               │
│                                                       │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐     │
│  │  Node 1   │   │  Node 2   │   │  Node 3   │     │
│  │  (master) │◀─▶│ (mirror)  │◀─▶│ (mirror)  │     │
│  │  AZ-1     │   │  AZ-2     │   │  AZ-3     │     │
│  └───────────┘   └───────────┘   └───────────┘     │
│                                                       │
│  Load Balancer: rabbitmq.insurance-system.internal    │
│  Management: https://rabbitmq.insurance-system.vn    │
│  AMQP Port: 5672 (internal) / 5671 (TLS)            │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### 9.2. Resource Allocation

| Resource | Per Node | Total |
|----------|----------|-------|
| CPU | 4 cores | 12 cores |
| RAM | 8 GB | 24 GB |
| Disk | 100 GB SSD | 300 GB |
| Network | 1 Gbps | - |

### 9.3. Quorum Queues

Production sử dụng Quorum Queues (thay vì classic mirrored) để:
- Stronger data safety guarantees
- Better performance under load
- Automatic leader election
- Built-in message deduplication

---

## 10. Development Guidelines

### 10.1. Producer Best Practices

```typescript
// TypeScript example - Publishing a message
import { Channel } from 'amqplib';

async function publishEvent(
  channel: Channel,
  exchange: string,
  routingKey: string,
  event: EventEnvelope
): Promise<void> {
  const message = Buffer.from(JSON.stringify(event));

  channel.publish(exchange, routingKey, message, {
    persistent: true,
    contentType: 'application/json',
    contentEncoding: 'utf-8',
    messageId: event.event_id,
    timestamp: Math.floor(Date.now() / 1000),
    type: event.event_type,
    appId: event.source,
    correlationId: event.correlation_id,
    headers: {
      'x-event-version': event.event_version,
    },
  });
}
```

### 10.2. Consumer Best Practices

```typescript
// TypeScript example - Consuming messages
import { Channel, ConsumeMessage } from 'amqplib';

async function consumeMessages(channel: Channel, queue: string): Promise<void> {
  await channel.prefetch(10);

  channel.consume(queue, async (msg: ConsumeMessage | null) => {
    if (!msg) return;

    try {
      const event: EventEnvelope = JSON.parse(msg.content.toString());

      // 1. Idempotency check
      if (await isProcessed(event.event_id)) {
        channel.ack(msg);
        return;
      }

      // 2. Process event
      await processEvent(event);

      // 3. Mark as processed
      await markProcessed(event.event_id);

      // 4. Acknowledge
      channel.ack(msg);
    } catch (error) {
      const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1;

      if (retryCount > 3) {
        // Send to DLQ
        channel.reject(msg, false);
      } else {
        // Retry with delay
        channel.reject(msg, true); // requeue
      }
    }
  });
}
```

### 10.3. Local Development

```yaml
# docker-compose.yml (development)
services:
  rabbitmq:
    image: rabbitmq:3.12-management
    ports:
      - "5672:5672"    # AMQP
      - "15672:15672"  # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: dev
      RABBITMQ_DEFAULT_PASS: dev123
      RABBITMQ_DEFAULT_VHOST: insurance
    volumes:
      - ./rabbitmq/definitions.json:/etc/rabbitmq/definitions.json
      - ./rabbitmq/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf
```

Access management UI: `http://localhost:15672` (dev/dev123)
