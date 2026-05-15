# Documentation Index - Mục Lục Tài Liệu

## Cấu trúc tài liệu

### 📁 01-Vision & Strategy
| # | Document | Description |
|---|----------|-------------|
| 1 | [Product Vision](01-vision-strategy/01-product-vision.md) | Tầm nhìn sản phẩm, đối tượng mục tiêu, value proposition |
| 2 | [Mission Statement](01-vision-strategy/02-mission-statement.md) | Sứ mệnh, giá trị cốt lõi, cam kết |
| 3 | [Product Strategy](01-vision-strategy/03-product-strategy.md) | Chiến lược sản phẩm, định vị, cạnh tranh |
| 4 | [Business Goals](01-vision-strategy/04-business-goals.md) | Mục tiêu kinh doanh, KPIs, OKRs |
| 5 | [Roadmap](01-vision-strategy/05-roadmap.md) | Lộ trình sản phẩm 3 năm chi tiết |
| 6 | [Go-to-Market Plan](01-vision-strategy/06-go-to-market-plan.md) | Kế hoạch ra mắt, marketing, kênh phân phối |

### 📁 02-Requirements Analysis
| # | Document | Description |
|---|----------|-------------|
| 1 | [BRD](02-requirements-analysis/01-BRD.md) | Business Requirements Document |
| 2 | [PRD](02-requirements-analysis/02-PRD.md) | Product Requirements Document |
| 3 | [SRS](02-requirements-analysis/03-SRS.md) | Software Requirements Specification |
| 4 | [Functional Requirements](02-requirements-analysis/04-functional-requirements.md) | Yêu cầu chức năng chi tiết từng module |
| 5 | [Non-functional Requirements](02-requirements-analysis/05-non-functional-requirements.md) | Performance, Security, Scalability, Compliance |
| 6 | [Use Cases](02-requirements-analysis/06-use-cases.md) | 11 use cases chi tiết |
| 7 | [User Stories](02-requirements-analysis/07-user-stories.md) | 22 user stories với acceptance criteria |
| 8 | [Epics & Features](02-requirements-analysis/08-epics-features.md) | 14 epics, feature breakdown, dependencies |

### 📁 03-Business Analysis
| # | Document | Description |
|---|----------|-------------|
| 1 | [Business Flow](03-business-analysis/01-business-flow.md) | 8 luồng nghiệp vụ chính end-to-end |
| 2 | [BPMN Diagrams](03-business-analysis/02-bpmn-diagram.md) | Sơ đồ quy trình chuẩn BPMN |
| 3 | [Domain Model](03-business-analysis/03-domain-model.md) | DDD bounded contexts, entities, aggregates |
| 4 | [Stakeholder Analysis](03-business-analysis/04-stakeholder-analysis.md) | 12 stakeholders, RACI matrix |
| 5 | [Risk Analysis](03-business-analysis/05-risk-analysis.md) | Risk register, mitigation plans, BCP |
| 6 | [Feasibility Study](03-business-analysis/06-feasibility-study.md) | Market, Technical, Financial, Legal feasibility |

### 📁 04-Development
| # | Document | Description |
|---|----------|-------------|
| 1 | [README](04-development/01-source-code/01-README.md) | Hướng dẫn tổng quan source code |
| 2 | [CONTRIBUTING](04-development/01-source-code/02-CONTRIBUTING.md) | Hướng dẫn đóng góp |
| 3 | [CHANGELOG](04-development/01-source-code/03-CHANGELOG.md) | Lịch sử thay đổi |
| 4 | [Code Style Guide](04-development/01-source-code/04-code-style-guide.md) | Quy chuẩn viết code |
| 5 | [Git Workflow](04-development/02-development-process/01-git-workflow.md) | Quy trình Git |
| 6 | [Branching Strategy](04-development/02-development-process/02-branching-strategy.md) | Chiến lược branching |
| 7 | [Commit Convention](04-development/02-development-process/03-commit-convention.md) | Quy ước commit message |
| 8 | [Pull Request Template](04-development/02-development-process/04-pull-request-template.md) | Template PR |
| 9 | [Code Review Checklist](04-development/02-development-process/05-code-review-checklist.md) | Checklist review code |
| 10 | [Environment Variables](04-development/03-environment/01-environment-variables.md) | Biến môi trường |
| 11 | [Local Setup Guide](04-development/03-environment/02-local-setup-guide.md) | Hướng dẫn cài đặt local |
| 12 | [Deployment Guide](04-development/03-environment/03-deployment-guide.md) | Hướng dẫn deploy |

### 📁 05-DevOps & Infrastructure

#### 🏗️ Infrastructure
| # | Document | Description |
|---|----------|-------------|
| 1 | [Infrastructure Diagram](05-devops-infrastructure/01-infrastructure/01-infrastructure-diagram.md) | Sơ đồ hạ tầng tổng quan, sizing, DR, chi phí |
| 2 | [Network Architecture](05-devops-infrastructure/01-infrastructure/02-network-architecture.md) | VPC, subnets, traffic flows, security groups, DNS |
| 3 | [Cloud Architecture](05-devops-infrastructure/01-infrastructure/03-cloud-architecture.md) | AWS services, EKS, data layer, IAM, encryption |

#### 🔄 CI/CD
| # | Document | Description |
|---|----------|-------------|
| 1 | [CI/CD Pipeline](05-devops-infrastructure/02-cicd/01-cicd-pipeline.md) | GitHub Actions + ArgoCD, workflows, quality gates |
| 2 | [Deployment Workflow](05-devops-infrastructure/02-cicd/02-deployment-workflow.md) | Quy trình deploy standard, hotfix, canary |
| 3 | [Rollback Procedure](05-devops-infrastructure/02-cicd/03-rollback-procedure.md) | Quy trình rollback, scenarios, automation |

#### 📊 Monitoring
| # | Document | Description |
|---|----------|-------------|
| 1 | [Logging Strategy](05-devops-infrastructure/03-monitoring/01-logging-strategy.md) | Winston + Fluent Bit + ELK, formats, PII masking |
| 2 | [Monitoring Setup](05-devops-infrastructure/03-monitoring/02-monitoring-setup.md) | Prometheus + Grafana + X-Ray, metrics, dashboards |
| 3 | [Alerting Rules](05-devops-infrastructure/03-monitoring/03-alerting-rules.md) | Severity levels, AlertManager, alert rules |
| 4 | [Incident Response Runbook](05-devops-infrastructure/03-monitoring/04-incident-response-runbook.md) | Incident classification, response process, runbooks |

#### 🐳 Container & Cloud
| # | Document | Description |
|---|----------|-------------|
| 1 | [Docker Docs](05-devops-infrastructure/04-container-cloud/01-docker-docs.md) | Multi-stage Dockerfiles, docker-compose, ECR, security |
| 2 | [Helm Charts](05-devops-infrastructure/04-container-cloud/02-helm-charts.md) | Base chart, per-service overrides, environments, operations |
