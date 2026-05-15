# Sequence Diagram - Sơ Đồ Tuần Tự

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Notation | UML Sequence Diagram (text-based) |

---

## 1. User Registration Sequence

```
┌──────┐     ┌─────────┐     ┌──────────┐     ┌───────┐     ┌───────┐
│Client│     │API GW   │     │Auth Svc  │     │  DB   │     │ Redis │
└──┬───┘     └────┬────┘     └────┬─────┘     └───┬───┘     └───┬───┘
   │              │               │                │             │
   │ POST /auth/register          │                │             │
   │ {email,phone,password,name}  │                │             │
   │─────────────▶│               │                │             │
   │              │  Validate     │                │             │
   │              │  rate limit   │                │             │
   │              │──────────────▶│                │             │
   │              │               │                │             │
   │              │               │ Check email    │             │
   │              │               │ uniqueness     │             │
   │              │               │───────────────▶│             │
   │              │               │  Not found ✓   │             │
   │              │               │◀───────────────│             │
   │              │               │                │             │
   │              │               │ Check phone    │             │
   │              │               │ uniqueness     │             │
   │              │               │───────────────▶│             │
   │              │               │  Not found ✓   │             │
   │              │               │◀───────────────│             │
   │              │               │                │             │
   │              │               │ Hash password  │             │
   │              │               │ (bcrypt 12)    │             │
   │              │               │                │             │
   │              │               │ Create user    │             │
   │              │               │ (status:inactive)            │
   │              │               │───────────────▶│             │
   │              │               │  User created  │             │
   │              │               │◀───────────────│             │
   │              │               │                │             │
   │              │               │ Generate OTP   │             │
   │              │               │ Store in Redis │             │
   │              │               │ (TTL: 5min)    │             │
   │              │               │────────────────────────────▶│
   │              │               │                │    Stored   │
   │              │               │◀────────────────────────────│
   │              │               │                │             │
   │              │               │ Queue: Send OTP│             │
   │              │               │ (Email + SMS)  │             │
   │              │               │────────────────────────────▶│
   │              │               │                │             │
   │              │  201 Created  │                │             │
   │              │◀──────────────│                │             │
   │ {userId,     │               │                │             │
   │  message}    │               │                │             │
   │◀─────────────│               │                │             │
   │              │               │                │             │
```

---

## 2. User Login Sequence

```
┌──────┐     ┌─────────┐     ┌──────────┐     ┌───────┐     ┌───────┐
│Client│     │API GW   │     │Auth Svc  │     │  DB   │     │ Redis │
└──┬───┘     └────┬────┘     └────┬─────┘     └───┬───┘     └───┬───┘
   │              │               │                │             │
   │ POST /auth/login             │                │             │
   │ {email, password}            │                │             │
   │─────────────▶│               │                │             │
   │              │──────────────▶│                │             │
   │              │               │                │             │
   │              │               │ Find user      │             │
   │              │               │───────────────▶│             │
   │              │               │  User found    │             │
   │              │               │◀───────────────│             │
   │              │               │                │             │
   │              │               │ Check locked?  │             │
   │              │               │ (lockedUntil)  │             │
   │              │               │                │             │
   │              │               │ Verify password│             │
   │              │               │ bcrypt.compare │             │
   │              │               │                │             │
   │              │               │ [if match]:    │             │
   │              │               │ Reset failed   │             │
   │              │               │ attempts = 0   │             │
   │              │               │───────────────▶│             │
   │              │               │                │             │
   │              │               │ Generate       │             │
   │              │               │ Access Token   │             │
   │              │               │ (JWT, 15min)   │             │
   │              │               │                │             │
   │              │               │ Generate       │             │
   │              │               │ Refresh Token  │             │
   │              │               │ (JWT, 7d)      │             │
   │              │               │                │             │
   │              │               │ Create session │             │
   │              │               │────────────────────────────▶│
   │              │               │                │             │
   │              │  200 OK       │                │             │
   │              │  Set-Cookie:  │                │             │
   │              │  refreshToken │                │             │
   │              │◀──────────────│                │             │
   │ {accessToken,│               │                │             │
   │  user}       │               │                │             │
   │◀─────────────│               │                │             │
```

---

## 3. Quote Generation Sequence

```
┌──────┐  ┌────────┐  ┌─────────┐  ┌───────┐  ┌──────────┐  ┌─────────┐
│Client│  │API GW  │  │Quote Svc│  │ Redis │  │Integr.Svc│  │Insurer  │
└──┬───┘  └───┬────┘  └────┬────┘  └───┬───┘  └────┬─────┘  └────┬────┘
   │          │            │            │           │              │
   │ POST /quotes          │            │           │              │
   │ {productType,         │            │           │              │
   │  customerInfo,        │            │           │              │
   │  coverage}            │            │           │              │
   │─────────▶│            │            │           │              │
   │          │───────────▶│            │           │              │
   │          │            │            │           │              │
   │          │            │ Check cache│           │              │
   │          │            │ (hash key) │           │              │
   │          │            │───────────▶│           │              │
   │          │            │ MISS       │           │              │
   │          │            │◀───────────│           │              │
   │          │            │            │           │              │
   │          │            │ Get eligible insurers  │              │
   │          │            │───────────────────────▶│              │
   │          │            │ [insurerA, B, C]       │              │
   │          │            │◀───────────────────────│              │
   │          │            │            │           │              │
   │          │            │ Promise.allSettled:     │              │
   │          │            │            │           │              │
   │          │            │ getQuote(A)│           │              │
   │          │            │───────────────────────▶│──────────── ▶│
   │          │            │ getQuote(B)│           │  (parallel)  │
   │          │            │───────────────────────▶│──────────── ▶│
   │          │            │ getQuote(C)│           │  (parallel)  │
   │          │            │───────────────────────▶│──────────── ▶│
   │          │            │            │           │              │
   │          │            │            │           │  Quote A     │
   │          │            │            │           │◀─────────────│
   │          │            │            │           │  Quote B     │
   │          │            │            │           │◀─────────────│
   │          │            │            │           │  Timeout C   │
   │          │            │            │           │    (skip)    │
   │          │            │            │           │              │
   │          │            │ Normalize  │           │              │
   │          │            │ & Rank     │           │              │
   │          │            │◀───────────────────────│              │
   │          │            │            │           │              │
   │          │            │ Cache result            │              │
   │          │            │ (TTL: 30min)           │              │
   │          │            │───────────▶│           │              │
   │          │            │            │           │              │
   │          │            │ Save to DB │           │              │
   │          │            │            │           │              │
   │          │ 200 OK     │            │           │              │
   │          │◀───────────│            │           │              │
   │ {quotes[],│            │            │           │              │
   │  quoteId}  │            │           │           │              │
   │◀─────────│            │            │           │              │
```

---

## 4. Purchase & Payment Sequence

```
┌──────┐  ┌────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐
│Client│  │API GW  │  │Policy   │  │Payment  │  │Pay GW   │  │Notif   │
│      │  │        │  │Service  │  │Service  │  │(VNPay)  │  │Service │
└──┬───┘  └───┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └───┬────┘
   │          │            │            │            │            │
   │ POST /policies        │            │            │            │
   │ {quoteId,appData}     │            │            │            │
   │─────────▶│───────────▶│            │            │            │
   │          │            │            │            │            │
   │          │            │ Validate   │            │            │
   │          │            │ quote      │            │            │
   │          │            │ (not expired)           │            │
   │          │            │            │            │            │
   │          │            │ Underwriting            │            │
   │          │            │ auto-check │            │            │
   │          │            │ → APPROVED │            │            │
   │          │            │            │            │            │
   │          │            │ Create policy           │            │
   │          │            │ (status:PENDING)        │            │
   │          │            │            │            │            │
   │          │ 201 {policyId,status}   │            │            │
   │◀─────────│◀───────────│            │            │            │
   │          │            │            │            │            │
   │ POST /payments        │            │            │            │
   │ {policyId,method:vnpay}            │            │            │
   │─────────▶│────────────────────────▶│            │            │
   │          │            │            │            │            │
   │          │            │            │ Create txn │            │
   │          │            │            │ (PENDING)  │            │
   │          │            │            │            │            │
   │          │            │            │ Create URL │            │
   │          │            │            │───────────▶│            │
   │          │            │            │ Payment URL│            │
   │          │            │            │◀───────────│            │
   │          │            │            │            │            │
   │          │ {paymentUrl}│            │            │            │
   │◀─────────│◀────────────────────────│            │            │
   │          │            │            │            │            │
   │ Redirect │            │            │            │            │
   │ to VNPay │            │            │            │            │
   │──────────────────────────────────────────────▶│            │
   │          │            │            │            │            │
   │ User completes payment on VNPay    │            │            │
   │          │            │            │            │            │
   │          │            │            │ Webhook    │            │
   │          │            │            │ callback   │            │
   │          │            │            │◀───────────│            │
   │          │            │            │            │            │
   │          │            │            │ Verify sig │            │
   │          │            │            │ Update txn │            │
   │          │            │            │ → SUCCESS  │            │
   │          │            │            │            │            │
   │          │            │            │ Emit event:│            │
   │          │            │            │ PaymentConfirmed         │
   │          │            │            │            │            │
   │          │            │ Activate   │            │            │
   │          │            │ policy     │            │            │
   │          │            │◀───────────│            │            │
   │          │            │ → ACTIVE   │            │            │
   │          │            │            │            │            │
   │          │            │ Emit: PolicyActivated   │            │
   │          │            │────────────────────────────────────▶│
   │          │            │            │            │    Send    │
   │          │            │            │            │   email +  │
   │          │            │            │            │    SMS     │
   │          │            │            │            │            │
   │ Redirect to success page          │            │            │
   │◀──────────────────────────────────────────────│            │
```

---

## 5. Claims Submission Sequence

```
┌──────┐  ┌────────┐  ┌─────────┐  ┌───────┐  ┌─────────┐  ┌────────┐
│Client│  │API GW  │  │Claims   │  │  DB   │  │Doc Svc  │  │Notif   │
│      │  │        │  │Service  │  │       │  │  (S3)   │  │Service │
└──┬───┘  └───┬────┘  └────┬────┘  └───┬───┘  └────┬────┘  └───┬────┘
   │          │            │            │           │            │
   │ POST /claims          │            │           │            │
   │ {policyId,type,       │            │           │            │
   │  details,documents[]} │            │           │            │
   │─────────▶│───────────▶│            │           │            │
   │          │            │            │           │            │
   │          │            │ Validate   │           │            │
   │          │            │ policy active          │            │
   │          │            │───────────▶│           │            │
   │          │            │  Policy OK │           │            │
   │          │            │◀───────────│           │            │
   │          │            │            │           │            │
   │          │            │ Validate   │           │            │
   │          │            │ coverage   │           │            │
   │          │            │ (claim type│           │            │
   │          │            │  covered?) │           │            │
   │          │            │            │           │            │
   │          │            │ Upload docs│           │            │
   │          │            │───────────────────────▶│            │
   │          │            │  URLs returned         │            │
   │          │            │◀───────────────────────│            │
   │          │            │            │           │            │
   │          │            │ Create claim           │            │
   │          │            │ (SUBMITTED)│           │            │
   │          │            │───────────▶│           │            │
   │          │            │  Created   │           │            │
   │          │            │◀───────────│           │            │
   │          │            │            │           │            │
   │          │            │ Auto-assign│           │            │
   │          │            │ handler    │           │            │
   │          │            │───────────▶│           │            │
   │          │            │            │           │            │
   │          │            │ Emit: ClaimSubmitted   │            │
   │          │            │───────────────────────────────────▶│
   │          │            │            │           │   Notify   │
   │          │            │            │           │  customer  │
   │          │            │            │           │  + handler │
   │          │ 201 {claimId, number, timeline}     │            │
   │◀─────────│◀───────────│            │           │            │
```

---

## 6. Policy Renewal Sequence

```
┌────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐
│Scheduler│  │Policy   │  │  DB     │  │Payment  │  │Notif   │
│(Cron)  │  │Service  │  │         │  │Service  │  │Service │
└───┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └───┬────┘
    │            │            │            │            │
    │ Trigger:   │            │            │            │
    │ daily check│            │            │            │
    │───────────▶│            │            │            │
    │            │            │            │            │
    │            │ Find expiring           │            │
    │            │ policies (30d)          │            │
    │            │───────────▶│            │            │
    │            │ [policies] │            │            │
    │            │◀───────────│            │            │
    │            │            │            │            │
    │            │ FOR EACH policy:        │            │
    │            │            │            │            │
    │            │ [auto_renewal=true]:    │            │
    │            │ Create renewal quote    │            │
    │            │ Charge saved method     │            │
    │            │───────────────────────▶│            │
    │            │            │  Success   │            │
    │            │◀───────────────────────│            │
    │            │            │            │            │
    │            │ Renew policy│            │            │
    │            │ (new term)  │            │            │
    │            │───────────▶│            │            │
    │            │            │            │            │
    │            │ Notify: Renewed         │            │
    │            │────────────────────────────────────▶│
    │            │            │            │            │
    │            │ [auto_renewal=false]:   │            │
    │            │ Send reminder           │            │
    │            │ (30d / 14d / 7d / 1d)  │            │
    │            │────────────────────────────────────▶│
    │            │            │            │   Email   │
    │            │            │            │   + SMS   │
    │            │            │            │            │
```

---

## 7. eKYC Verification Sequence

```
┌──────┐  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────┐
│Client│  │API GW   │  │Doc Svc   │  │eKYC Svc │  │  S3    │
└──┬───┘  └────┬────┘  └────┬─────┘  └────┬────┘  └───┬────┘
   │          │            │              │            │
   │ POST /kyc/verify      │              │            │
   │ {cccd_front,          │              │            │
   │  cccd_back,           │              │            │
   │  selfie}              │              │            │
   │─────────▶│───────────▶│              │            │
   │          │            │              │            │
   │          │            │ Upload images│            │
   │          │            │─────────────────────────▶│
   │          │            │  URLs        │            │
   │          │            │◀─────────────────────────│
   │          │            │              │            │
   │          │            │ OCR request  │            │
   │          │            │ (front+back) │            │
   │          │            │─────────────▶│            │
   │          │            │              │ Extract:   │
   │          │            │              │ name, DOB, │
   │          │            │              │ id_number, │
   │          │            │              │ address    │
   │          │            │ OCR result   │            │
   │          │            │◀─────────────│            │
   │          │            │              │            │
   │          │            │ Face match   │            │
   │          │            │ (CCCD vs     │            │
   │          │            │  selfie)     │            │
   │          │            │─────────────▶│            │
   │          │            │ Match score  │            │
   │          │            │ (>80% = pass)│            │
   │          │            │◀─────────────│            │
   │          │            │              │            │
   │          │            │ Liveness     │            │
   │          │            │ check        │            │
   │          │            │─────────────▶│            │
   │          │            │ Result       │            │
   │          │            │◀─────────────│            │
   │          │            │              │            │
   │          │ 200 {status: verified,    │            │
   │          │  extractedData, score}    │            │
   │◀─────────│◀───────────│              │            │
```
