export enum SubmissionStatus {
  Pending = 'Pendente',
  Approved = 'Aprovado',
  Rejected = 'Rejeitado',
}

export interface PaymentSubmission {
  id: number;
  userId: string;
  packageId: string;
  packageName: string;
  packageDiamonds: number;
  receiptImage: string; // base64 encoded image
  status: SubmissionStatus;
  timestamp: string;
}

// FIX: Add AspectRatio type for ImageStudio component
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

// FIX: Add Message type for AIAssistant component
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  mode?: 'Fast' | 'Thinking';
}
