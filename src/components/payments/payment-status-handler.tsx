'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { updateTransactionStatus } from '@/lib/supabaseService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function PaymentStatusHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error' | null; text: string } | null>(null);

  React.useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const transactionId = searchParams.get('transaction_id');

    if (!transactionId) return;

    if (success === 'true') {
      handlePaymentSuccess(transactionId);
    } else if (canceled === 'true') {
      handlePaymentCanceled(transactionId);
    }
  }, [searchParams]);

  async function handlePaymentSuccess(transactionId: string) {
    setProcessing(true);
    try {
      // Update transaction status to Paid
      const updated = await updateTransactionStatus(transactionId, 'Paid', `stripe_${Date.now()}`);
      
      if (updated) {
        setMessage({
          type: 'success',
          text: 'Payment successful! Transaction has been marked as paid.',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Payment completed but failed to update status. Please refresh the page.',
        });
      }

      // Clear URL parameters after 3 seconds
      setTimeout(() => {
        const newUrl = window.location.pathname;
        router.replace(newUrl);
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating transaction:', error);
      setMessage({
        type: 'error',
        text: 'Error updating transaction status.',
      });
    } finally {
      setProcessing(false);
    }
  }

  async function handlePaymentCanceled(transactionId: string) {
    setMessage({
      type: 'error',
      text: 'Payment was canceled. The transaction remains pending.',
    });

    // Clear message after 3 seconds
    setTimeout(() => {
      const newUrl = window.location.pathname;
      router.replace(newUrl);
      setMessage(null);
    }, 3000);
  }

  if (!message && !processing) return null;

  return (
    <div className="mb-6">
      {processing && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Processing</AlertTitle>
          <AlertDescription>Updating transaction status...</AlertDescription>
        </Alert>
      )}
      
      {message && message.type === 'success' && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">Success</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            {message.text}
          </AlertDescription>
        </Alert>
      )}
      
      {message && message.type === 'error' && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 dark:text-red-200">Error</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300">
            {message.text}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
