# Helm Charts Documentation - Tài Liệu Helm Charts

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Helm Version | 3.x |
| Chart Repository | OCI (Amazon ECR) |

---

## 1. Helm Charts Overview

### 1.1. Chart Structure

```
deploy/helm/
├── charts/
│   ├── insurance-service/        # Generic microservice chart (shared)
│   │   ├── Chart.yaml
│   │   ├── values.yaml           # Default values
│   │   ├── templates/
│   │   │   ├── _helpers.tpl
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   ├── ingress.yaml
│   │   │   ├── hpa.yaml
│   │   │   ├── pdb.yaml
│   │   │   ├── serviceaccount.yaml
│   │   │   ├── configmap.yaml
│   │   │   ├── secret.yaml
│   │   │   └── tests/
│   │   │       └── test-connection.yaml
│   │   └── README.md
│   │
│   └── frontend/                  # Frontend-specific chart
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── deployment.yaml
│           ├── service.yaml
│           ├── ingress.yaml
│           └── hpa.yaml
│
├── environments/
│   ├── values-development.yaml
│   ├── values-staging.yaml
│   ├── values-production.yaml
│   └── values-dr.yaml
│
└── services/                      # Per-service value overrides
    ├── auth-service.yaml
    ├── product-service.yaml
    ├── policy-service.yaml
    ├── quote-service.yaml
    ├── claims-service.yaml
    ├── payment-service.yaml
    ├── notification-service.yaml
    ├── document-service.yaml
    └── integration-service.yaml
```

### 1.2. Chart Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    HELM CHART STRATEGY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  APPROACH: Shared Base Chart + Per-Service Overrides             │
│                                                                   │
│  ┌────────────────────────────────────────┐                     │
│  │    insurance-service (base chart)       │                     │
│  │    ─────────────────────────────────    │                     │
│  │    • Common templates (deploy, svc,     │                     │
│  │      ingress, hpa, pdb, configmap)     │                     │
│  │    • Shared defaults                    │                     │
│  │    • Standardized labels & annotations  │                     │
│  └───────────────────┬────────────────────┘                     │
│                      │                                           │
│         ┌────────────┼────────────┐                             │
│         ▼            ▼            ▼                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                  │
│  │auth-service│ │quote-svc   │ │payment-svc │  ...             │
│  │.yaml       │ │.yaml       │ │.yaml       │                  │
│  │(overrides) │ │(overrides) │ │(overrides) │                  │
│  └────────────┘ └────────────┘ └────────────┘                  │
│         │            │            │                             │
│         ▼            ▼            ▼                             │
│  ┌──────────────────────────────────────────┐                  │
│  │  Environment Values (staging/production)  │                  │
│  │  • Replicas, resources, domain, secrets   │                  │
│  └──────────────────────────────────────────┘                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Base Chart: insurance-service

### 2.1. Chart.yaml

```yaml
# charts/insurance-service/Chart.yaml
apiVersion: v2
name: insurance-service
description: Base Helm chart for Insurance System microservices
type: application
version: 1.0.0
appVersion: "1.0.0"
keywords:
  - insurance
  - microservice
  - nodejs
maintainers:
  - name: DevOps Team
    email: devops@insurance-system.vn
```

### 2.2. Default values.yaml

```yaml
# charts/insurance-service/values.yaml

# ─── Service Identity ───
nameOverride: ""
fullnameOverride: ""
serviceName: "service"

# ─── Image Configuration ───
image:
  repository: 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/insurance-system/service
  tag: "latest"
  pullPolicy: IfNotPresent

imagePullSecrets:
  - name: ecr-credentials

# ─── Replicas & Scaling ───
replicaCount: 2

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 8
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

# ─── Container Configuration ───
containerPort: 3000

resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1Gi

# ─── Health Checks ───
livenessProbe:
  httpGet:
    path: /health/live
    port: http
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/ready
    port: http
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3

startupProbe:
  httpGet:
    path: /health/live
    port: http
  failureThreshold: 30
  periodSeconds: 2

# ─── Service ───
service:
  type: ClusterIP
  port: 80
  targetPort: 3000

# ─── Ingress ───
ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
  hosts:
    - host: api.insurance-system.vn
      paths:
        - path: /api/v1/service
          pathType: Prefix
  tls:
    - secretName: api-tls
      hosts:
        - api.insurance-system.vn

# ─── Environment Variables ───
env: []
  # - name: NODE_ENV
  #   value: production

envFrom: []
  # - secretRef:
  #     name: db-credentials
  # - configMapRef:
  #     name: app-config

# ─── ConfigMap ───
configMap:
  enabled: false
  data: {}

# ─── Secrets (External Secrets) ───
externalSecret:
  enabled: true
  refreshInterval: 1h
  secretStoreName: aws-secrets-manager
  data: []

# ─── Service Account ───
serviceAccount:
  create: true
  annotations: {}
  # eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/service-role

# ─── Pod Disruption Budget ───
podDisruptionBudget:
  enabled: true
  minAvailable: 1
  # maxUnavailable: 1

# ─── Node Affinity & Tolerations ───
nodeSelector: {}

tolerations: []

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - "{{ .Values.serviceName }}"
          topologyKey: kubernetes.io/hostname

# ─── Pod Annotations ───
podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "3000"
  prometheus.io/path: "/metrics"

# ─── Security Context ───
podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1001
  runAsGroup: 1001
  fsGroup: 1001

securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL

# ─── Additional Volumes ───
volumes:
  - name: tmp
    emptyDir: {}

volumeMounts:
  - name: tmp
    mountPath: /tmp
```

### 2.3. Key Templates

#### Deployment Template

```yaml
# charts/insurance-service/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "insurance-service.fullname" . }}
  labels:
    {{- include "insurance-service.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      {{- include "insurance-service.selectorLabels" . | nindent 6 }}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  template:
    metadata:
      annotations:
        {{- toYaml .Values.podAnnotations | nindent 8 }}
      labels:
        {{- include "insurance-service.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "insurance-service.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.containerPort }}
              protocol: TCP
          {{- with .Values.env }}
          env:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with .Values.envFrom }}
          envFrom:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          livenessProbe:
            {{- toYaml .Values.livenessProbe | nindent 12 }}
          readinessProbe:
            {{- toYaml .Values.readinessProbe | nindent 12 }}
          startupProbe:
            {{- toYaml .Values.startupProbe | nindent 12 }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          {{- with .Values.volumeMounts }}
          volumeMounts:
            {{- toYaml . | nindent 12 }}
          {{- end }}
      {{- with .Values.volumes }}
      volumes:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
```

#### HPA Template

```yaml
# charts/insurance-service/templates/hpa.yaml
{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "insurance-service.fullname" . }}
  labels:
    {{- include "insurance-service.labels" . | nindent 4 }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "insurance-service.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetMemoryUtilizationPercentage }}
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 2
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Pods
          value: 1
          periodSeconds: 120
{{- end }}
```

---

## 3. Per-Service Overrides

### 3.1. Auth Service

```yaml
# services/auth-service.yaml
serviceName: auth-service

image:
  repository: 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/insurance-system/auth-service

replicaCount: 3

resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: 500m
    memory: 1Gi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 8
  targetCPUUtilizationPercentage: 60

ingress:
  hosts:
    - host: api.insurance-system.vn
      paths:
        - path: /api/v1/auth
          pathType: Prefix

env:
  - name: SERVICE_NAME
    value: auth-service
  - name: JWT_EXPIRY
    value: "900"  # 15 minutes

envFrom:
  - secretRef:
      name: auth-service-secrets
  - configMapRef:
      name: app-common-config

externalSecret:
  enabled: true
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: insurance-system/production/auth-service
        property: database_url
    - secretKey: JWT_SECRET
      remoteRef:
        key: insurance-system/production/auth-service
        property: jwt_secret
    - secretKey: REDIS_URL
      remoteRef:
        key: insurance-system/production/common
        property: redis_url

serviceAccount:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/auth-service-role
```

### 3.2. Payment Service (Higher Resources)

```yaml
# services/payment-service.yaml
serviceName: payment-service

image:
  repository: 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/insurance-system/payment-service

replicaCount: 3

resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 1000m
    memory: 2Gi

autoscaling:
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 50  # Lower threshold (critical service)

ingress:
  hosts:
    - host: api.insurance-system.vn
      paths:
        - path: /api/v1/payments
          pathType: Prefix

env:
  - name: SERVICE_NAME
    value: payment-service
  - name: PAYMENT_TIMEOUT_MS
    value: "30000"

externalSecret:
  enabled: true
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: insurance-system/production/payment-service
        property: database_url
    - secretKey: VNPAY_SECRET
      remoteRef:
        key: insurance-system/production/payment-service
        property: vnpay_secret
    - secretKey: MOMO_SECRET
      remoteRef:
        key: insurance-system/production/payment-service
        property: momo_secret
```

---

## 4. Environment Values

### 4.1. Staging Values

```yaml
# environments/values-staging.yaml
global:
  environment: staging
  domain: staging.insurance-system.vn
  apiDomain: api-staging.insurance-system.vn

replicaCount: 1

autoscaling:
  enabled: false

resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi

ingress:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-staging
  hosts:
    - host: api-staging.insurance-system.vn
  tls:
    - secretName: api-staging-tls
      hosts:
        - api-staging.insurance-system.vn

env:
  - name: NODE_ENV
    value: staging
  - name: LOG_LEVEL
    value: debug
```

### 4.2. Production Values

```yaml
# environments/values-production.yaml
global:
  environment: production
  domain: insurance-system.vn
  apiDomain: api.insurance-system.vn

replicaCount: 3

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10

resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1Gi

ingress:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
  hosts:
    - host: api.insurance-system.vn
  tls:
    - secretName: api-prod-tls
      hosts:
        - api.insurance-system.vn

env:
  - name: NODE_ENV
    value: production
  - name: LOG_LEVEL
    value: info

podDisruptionBudget:
  enabled: true
  minAvailable: 2
```

---

## 5. Helm Operations

### 5.1. Common Commands

```bash
# ─── Install / Upgrade ───
# Deploy auth-service to staging
helm upgrade --install auth-service ./charts/insurance-service \
  -f ./services/auth-service.yaml \
  -f ./environments/values-staging.yaml \
  --set image.tag=abc123 \
  --namespace staging \
  --create-namespace

# Deploy to production
helm upgrade --install auth-service ./charts/insurance-service \
  -f ./services/auth-service.yaml \
  -f ./environments/values-production.yaml \
  --set image.tag=v1.5.2 \
  --namespace production

# ─── Status & Debug ───
# Check release status
helm status auth-service -n production

# View rendered templates (dry-run)
helm template auth-service ./charts/insurance-service \
  -f ./services/auth-service.yaml \
  -f ./environments/values-production.yaml \
  --set image.tag=v1.5.2

# Show computed values
helm get values auth-service -n production

# View release history
helm history auth-service -n production

# ─── Rollback ───
# Rollback to previous version
helm rollback auth-service 0 -n production

# Rollback to specific revision
helm rollback auth-service 3 -n production

# ─── Uninstall ───
helm uninstall auth-service -n staging

# ─── Lint & Test ───
helm lint ./charts/insurance-service -f ./services/auth-service.yaml
helm test auth-service -n staging
```

### 5.2. Deployment Script

```bash
#!/bin/bash
# scripts/deploy.sh - Deploy a service to an environment

set -euo pipefail

SERVICE=$1
ENVIRONMENT=$2
IMAGE_TAG=$3

echo "Deploying ${SERVICE} to ${ENVIRONMENT} with tag ${IMAGE_TAG}"

# Validate inputs
if [[ ! -f "services/${SERVICE}.yaml" ]]; then
  echo "Error: Service file services/${SERVICE}.yaml not found"
  exit 1
fi

if [[ ! -f "environments/values-${ENVIRONMENT}.yaml" ]]; then
  echo "Error: Environment file environments/values-${ENVIRONMENT}.yaml not found"
  exit 1
fi

# Deploy
helm upgrade --install "${SERVICE}" ./charts/insurance-service \
  -f "./services/${SERVICE}.yaml" \
  -f "./environments/values-${ENVIRONMENT}.yaml" \
  --set "image.tag=${IMAGE_TAG}" \
  --namespace "${ENVIRONMENT}" \
  --wait \
  --timeout 5m

echo "✅ ${SERVICE} deployed successfully to ${ENVIRONMENT}"

# Verify
kubectl rollout status "deployment/${SERVICE}" -n "${ENVIRONMENT}" --timeout=3m
echo "✅ Rollout verified"
```

---

## 6. Chart Testing

### 6.1. Helm Test

```yaml
# charts/insurance-service/templates/tests/test-connection.yaml
apiVersion: v1
kind: Pod
metadata:
  name: "{{ include "insurance-service.fullname" . }}-test"
  labels:
    {{- include "insurance-service.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": test
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  containers:
    - name: wget
      image: busybox:latest
      command: ['wget']
      args: ['{{ include "insurance-service.fullname" . }}:{{ .Values.service.port }}/health/live']
  restartPolicy: Never
```

### 6.2. Chart Validation in CI

```yaml
# .github/workflows/helm-lint.yml
name: Helm Chart Validation

on:
  pull_request:
    paths: ['deploy/helm/**']

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/setup-helm@v3

      - name: Lint all service configurations
        run: |
          for service in deploy/helm/services/*.yaml; do
            svc_name=$(basename $service .yaml)
            echo "Linting ${svc_name}..."
            helm lint deploy/helm/charts/insurance-service \
              -f "${service}" \
              -f deploy/helm/environments/values-production.yaml \
              --set image.tag=test
          done

      - name: Template validation
        run: |
          helm template test deploy/helm/charts/insurance-service \
            -f deploy/helm/services/auth-service.yaml \
            -f deploy/helm/environments/values-production.yaml \
            --set image.tag=test | kubectl apply --dry-run=client -f -
```
