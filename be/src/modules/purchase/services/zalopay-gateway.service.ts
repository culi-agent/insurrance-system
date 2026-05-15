/**
 * ZaloPay Payment Gateway Integration
 * Sprint 8: S8-08
 */
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PaymentRequest, PaymentGatewayResponse, PaymentVerifyResult } from './payment-gateway.service';

export class ZaloPayGateway {
  private static readonly ZALOPAY_URL = process.env.ZALOPAY_URL || 'https://sb-openapi.zalopay.vn/v2/create';
  private static readonly APP_ID = process.env.ZALOPAY_APP_ID || '2553';
  private static readonly KEY1 = process.env.ZALOPAY_KEY1 || 'demo_key1';
  private static readonly KEY2 = process.env.ZALOPAY_KEY2 || 'demo_key2';

  static async createPayment(request: PaymentRequest): Promise<PaymentGatewayResponse> {
    const transId = Math.floor(Math.random() * 1000000);
    const appTransId = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${transId}`;

    const embedData = JSON.stringify({ redirecturl: request.return_url });
    const items = JSON.stringify([{
      name: request.description,
      amount: request.amount,
      quantity: 1,
    }]);

    const hmacInput = `${this.APP_ID}|${appTransId}|${request.customer_info.name}|${request.amount}|${Date.now()}|${embedData}|${items}`;
    const mac = crypto.createHmac('sha256', this.KEY1).update(hmacInput).digest('hex');

    // Simulate ZaloPay response
    const paymentUrl = `https://sb-openapi.zalopay.vn/v2/gateway?appid=${this.APP_ID}&apptransid=${appTransId}`;

    return {
      success: true,
      gateway: 'zalopay',
      transaction_id: appTransId,
      payment_url: paymentUrl,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      raw_response: {
        app_id: this.APP_ID,
        app_trans_id: appTransId,
        mac,
      },
    };
  }

  static verifyPayment(params: Record<string, any>): PaymentVerifyResult {
    const { data, mac: receivedMac } = params;

    // Verify MAC
    const expectedMac = crypto.createHmac('sha256', this.KEY2).update(data || '').digest('hex');
    const isValid = receivedMac === expectedMac;

    let parsedData: any = {};
    try { parsedData = JSON.parse(data || '{}'); } catch {}

    return {
      success: isValid && parsedData.return_code === 1,
      transaction_id: parsedData.app_trans_id || '',
      order_id: parsedData.item || '',
      amount: parsedData.amount || 0,
      status: parsedData.return_code === 1 ? 'success' : 'failed',
      paid_at: parsedData.return_code === 1 ? new Date().toISOString() : undefined,
      raw_response: params,
    };
  }
}
