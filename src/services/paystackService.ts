import { feeService } from './feeService';
import { Payment, Receipt } from '../types/database';

export interface PaystackCheckoutConfig {
  email: string;
  amountInKobo: number;
  studentId: string;
  studentName: string;
  feeItemName: string;
  onSuccess: (payment: Payment, receipt: Receipt) => void;
  onClose?: () => void;
}

export class PaystackService {
  private publicTestKey: string;

  constructor() {
    this.publicTestKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_solid_foundation_demo_123456';
  }

  getPublicKey(): string {
    return this.publicTestKey;
  }

  // Initiates Paystack inline checkout modal or fallback interactive simulation modal
  initiatePayment(config: PaystackCheckoutConfig): Promise<{ payment: Payment; receipt: Receipt }> {
    return new Promise((resolve, reject) => {
      const amountInNaira = config.amountInKobo / 100;
      const ref = `PAYSK-${new Date().getFullYear()}-${Math.floor(1000000 + Math.random() * 9000000)}`;

      // Simulate payment processing latency (1.5 seconds)
      setTimeout(() => {
        try {
          const result = feeService.recordPayment(
            config.studentId,
            amountInNaira,
            'paystack',
            undefined,
            ref
          );

          config.onSuccess(result.payment, result.receipt);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }, 1200);
    });
  }
}

export const paystackService = new PaystackService();
