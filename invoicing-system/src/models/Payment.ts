export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  OTHER = 'OTHER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REVERSED = 'REVERSED'
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  receivedAt: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePaymentDto = {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  receivedAt?: string;
  reference?: string;
};

export type UpdatePaymentDto = Partial<CreatePaymentDto> & {
  id: string;
};