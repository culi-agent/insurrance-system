# BPMN Diagrams - Sơ Đồ Quy Trình Nghiệp Vụ

---

## 1. BPMN: Quy trình mua bảo hiểm (Purchase Process)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: Insurance Purchase Process                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Lane: Customer                                                               │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ (○)──▶[Browse Products]──▶[Select Product]──▶[Fill Quote Form]              │
│                                                      │                       │
│                                                      ▼                       │
│         [Review Quotes]◀────────────────────[Get Multi-Quote]               │
│              │                                                                │
│              ▼                                                                │
│         ◇ Decision                                                           │
│         │Buy│Save│Leave                                                      │
│         │   │    └──▶(○) End                                                │
│         │   └──▶[Save to Dashboard]──▶(○) End                               │
│         ▼                                                                    │
│    [Fill Application Form]──▶[Upload CCCD]──▶[Review Summary]               │
│                                                      │                       │
│                                                      ▼                       │
│    [Accept T&C]──▶[Select Payment]──▶[Complete Payment]                     │
│                                              │                               │
│                                              ▼                               │
│                                    ◇ Payment Result                          │
│                                    │Success│Failure│                          │
│                                    │       └──▶[Retry/Change Method]──┐      │
│                                    ▼                                  │      │
│    [Receive Confirmation]◀──[View Policy]                            │      │
│         │                                                     (loop) │      │
│         ▼                                                            │      │
│        (○) End                                                       │      │
│                                                                              │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Lane: System                                                                 │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ [Validate Form]──▶[Call Insurer APIs]──▶[Aggregate Results]                 │
│                                                                              │
│ [Process eKYC]──▶◇ KYC Result                                              │
│                   │Pass│Fail│                                                │
│                   │    └──▶[Flag Manual Review]                              │
│                   ▼                                                           │
│ [Run Underwriting]──▶◇ UW Decision                                          │
│                       │Accept│Refer│Decline│                                 │
│                       │      │     └──▶[Send Decline Notice]                │
│                       │      └──▶[Queue for Manual UW]                      │
│                       ▼                                                      │
│ [Create Payment Intent]──▶[Process Payment]──▶◇ Status                      │
│                                                │OK│Fail│                     │
│                                                │  └──▶[Log Failure]         │
│                                                ▼                             │
│ [Generate Policy]──▶[Generate PDF]──▶[Send Email/SMS]──▶[Activate Policy]   │
│                                                                              │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Lane: Insurer API                                                            │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ [Receive Quote Request]──▶[Calculate Premium]──▶[Return Quote]              │
│                                                                              │
│ [Receive Policy Request]──▶[Validate]──▶[Issue Policy Number]──▶[Confirm]   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. BPMN: Quy trình bồi thường (Claims Process)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: Claims Processing                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Lane: Customer                                                               │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ (○)──▶[Login]──▶[Select Policy]──▶[Fill Claim Form]──▶[Upload Documents]   │
│                                                              │               │
│                                                              ▼               │
│                                                    [Submit Claim]            │
│                                                              │               │
│         ┌────────────────────────────────────────────────────┘               │
│         │                                                                    │
│         ▼                                                                    │
│    [Receive Claim Number]──▶[Track Status]                                  │
│                                   │                                          │
│                                   ▼                                          │
│                          ◇ Additional Info?                                  │
│                          │Yes│No│                                            │
│                          │   └──▶[Wait for Decision]                        │
│                          ▼                                                   │
│                    [Provide Documents]──▶[Re-submit]                         │
│                                                                              │
│    [Receive Decision]──▶◇ Decision                                          │
│                          │Approved│Rejected│                                 │
│                          │        └──▶◇ Appeal?                             │
│                          │             │Yes│No│                              │
│                          │             │   └──▶(○)End                       │
│                          │             └──▶[Submit Appeal]                   │
│                          ▼                                                   │
│    [Receive Payment]──▶[Rate Experience]──▶(○) End                          │
│                                                                              │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Lane: Claims Operations                                                      │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ ⏱(Timer: 4h)                                                                │
│ [Auto-Assign Handler]──▶[Review Claim]──▶[Verify Documents]                │
│                                                   │                          │
│                                                   ▼                          │
│                                          ◇ Docs Complete?                   │
│                                          │Yes│No│                            │
│                                          │   └──▶[Request Info]──▶⏱(7 days)│
│                                          ▼                                   │
│ [Assess Damage/Loss]──▶[Calculate Settlement]──▶◇ Amount > Threshold?       │
│                                                   │<5M│>5M│                  │
│                                                   │   └──▶[Escalate Manager]│
│                                                   ▼                          │
│ [Make Decision]──▶[Record Decision]──▶[Notify Customer]                     │
│                                                                              │
│ ◇ Approved?                                                                 │
│ │Yes│No│                                                                     │
│ │   └──▶[Send Rejection + Reason]                                           │
│ ▼                                                                            │
│ [Initiate Payment]──▶[Bank Transfer]──▶[Confirm Settlement]──▶(○) End      │
│                                                                              │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Lane: Insurer                                                                │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ [Receive Claim Notification]──▶[Review (if complex)]──▶[Approve/Reject]     │
│                                                                              │
│ [Process Settlement Fund]──▶[Transfer to Platform]                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. BPMN: Quy trình gia hạn (Renewal Process)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: Policy Renewal Process                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Lane: System (Automated)                                                     │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ ⏱(Daily at 00:00)                                                           │
│ [Scan Expiring Policies]──▶◇ Days to Expiry?                               │
│                              │30│14│7│3│1│0│                                 │
│                              │  │  │ │ │ │                                   │
│                              ▼  ▼  ▼ ▼ ▼ ▼                                  │
│ [Send Reminder Email]   (escalating urgency & channels)                     │
│                                                                              │
│ ◇ Auto-renewal enabled?                                                     │
│ │Yes│No│                                                                     │
│ │   └──▶[Wait for Customer Action]                                          │
│ ▼                                                                            │
│ [Calculate Renewal Premium]──▶[Charge Saved Method]──▶◇ Payment OK?         │
│                                                        │Yes│No│              │
│                                                        │   └──▶[Retry x3]  │
│                                                        ▼                     │
│ [Renew Policy]──▶[Send Confirmation]──▶(○) End                              │
│                                                                              │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Lane: Customer                                                               │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ [Receive Reminder]──▶[Login to Dashboard]──▶◇ Action?                       │
│                                              │Renew│Change│Let Expire│       │
│                                              │     │      └──▶(○)End        │
│                                              │     └──▶[Adjust Coverage]──┐  │
│                                              │                            │  │
│                                              ▼◀───────────────────────────┘  │
│ [Review Renewal Quote]──▶[Confirm & Pay]──▶[Receive New Policy]──▶(○)End    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. BPMN: Quy trình đối soát tài chính (Reconciliation)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: Monthly Financial Reconciliation                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ⏱(Monthly, Day 5)                                                           │
│                                                                              │
│ [Export Platform Transactions]──▶[Export Insurer Records]                    │
│                     │                        │                               │
│                     └──────────┬─────────────┘                               │
│                                ▼                                             │
│                    [Match Transactions]                                       │
│                                │                                             │
│                                ▼                                             │
│                    ◇ All Matched?                                            │
│                    │Yes│No│                                                   │
│                    │   └──▶[Flag Discrepancies]──▶[Investigate]──▶[Resolve] │
│                    ▼                                                          │
│     [Calculate Net Amount Due]                                               │
│                    │                                                          │
│                    ├──▶[Platform Commission = GWP × Rate]                    │
│                    │                                                          │
│                    └──▶[Amount to Insurer = GWP - Commission]                │
│                                │                                             │
│                                ▼                                             │
│     [Generate Settlement Report]──▶[Send to Insurer]──▶[Receive Confirm]    │
│                                                              │               │
│                                                              ▼               │
│     [Process Wire Transfer]──▶[Record Settlement]──▶(○) End                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. BPMN: Quy trình onboard đối tác bảo hiểm

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: Partner Onboarding                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Lane: Business Development                                                   │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ (○)──▶[Initial Contact]──▶[Present Platform]──▶[Negotiate Terms]            │
│                                                        │                     │
│                                                        ▼                     │
│              ◇ Agreement?                                                    │
│              │Yes│No│                                                         │
│              │   └──▶(○) End                                                │
│              ▼                                                                │
│ [Sign Contract]──▶[Handover to Tech Team]                                   │
│                                                                              │
│ Lane: Technical Team                                                         │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ [Receive API Docs]──▶[Setup Sandbox]──▶[Develop Integration]               │
│                                                   │                          │
│                                                   ▼                          │
│ [API Testing]──▶[Security Audit]──▶◇ Pass?                                 │
│                                     │Yes│No│                                 │
│                                     │   └──▶[Fix Issues]──┐                 │
│                                     │◀────────────────────┘                 │
│                                     ▼                                        │
│ [UAT Testing]──▶[Performance Test]──▶[Go-Live Approval]                     │
│                                                                              │
│ Lane: Operations                                                             │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ [Configure Products]──▶[Setup Pricing]──▶[Configure UW Rules]               │
│                                                   │                          │
│                                                   ▼                          │
│ [Train Staff]──▶[Soft Launch (5% traffic)]──▶[Monitor]──▶◇ Stable?          │
│                                                           │Yes│No│           │
│                                                           │   └──▶[Debug]   │
│                                                           ▼                  │
│ [Full Launch]──▶[Monitor 2 weeks]──▶[Partner Review]──▶(○) End              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. BPMN Notation Legend

| Symbol | Meaning |
|--------|---------|
| (○) | Start/End Event |
| [Task] | Activity/Task |
| ◇ | Gateway (Decision point) |
| ⏱ | Timer Event |
| ──▶ | Sequence Flow |
| ···▶ | Message Flow |
| Lane | Swimlane (Actor/Department) |
| Pool | Process boundary |

---

## 7. Process Metrics & KPIs

| Process | Metric | Target | Current |
|---------|--------|--------|---------|
| Purchase (simple) | End-to-end time | < 5 min | - |
| Purchase (complex) | End-to-end time | < 15 min | - |
| Claims (simple) | Submission to settlement | < 7 days | - |
| Claims (complex) | Submission to settlement | < 15 days | - |
| Renewal | Reminder to renewal | < 3 min (if immediate) | - |
| Reconciliation | Monthly close | < 5 business days | - |
| Partner Onboarding | Contract to go-live | < 8 weeks | - |
| Support Resolution | Average resolution time | < 24 hours | - |
