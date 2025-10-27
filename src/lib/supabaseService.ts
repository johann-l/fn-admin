// lib/supabaseService.ts - Service to fetch real data from Supabase
import { supabase } from './supabaseClient';
import type { Payment } from './data';

export interface SupabaseTransaction {
  id: string;
  description: string | null;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Failed';
  type: 'Incoming' | 'Outgoing';
  method: string | null;
  user_id: string | null;
  reference_id: string | null;
  metadata: any;
}

/**
 * Fetch all transactions from Supabase
 */
export async function fetchTransactions(): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    // Transform Supabase data to Payment type
    const payments: Payment[] = (data || []).map((tx: SupabaseTransaction) => ({
      id: tx.id,
      description: tx.description || 'No description',
      amount: tx.amount, // Already in correct format (decimal in DB)
      date: new Date(tx.date),
      status: tx.status,
      type: tx.type,
      method: (tx.method || 'Credit Card') as Payment['method'],
    }));

    return payments;
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    // Return empty array on error to prevent app crash
    return [];
  }
}

/**
 * Fetch single transaction by ID
 */
export async function fetchTransactionById(transactionId: string): Promise<Payment | null> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }

    if (!data) return null;

    const tx = data as SupabaseTransaction;
    return {
      id: tx.id,
      description: tx.description || 'No description',
      amount: tx.amount,
      date: new Date(tx.date),
      status: tx.status,
      type: tx.type,
      method: (tx.method || 'Credit Card') as Payment['method'],
    };
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    return null;
  }
}

/**
 * Update transaction status in Supabase
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: 'Paid' | 'Pending' | 'Failed',
  referenceId?: string
): Promise<boolean> {
  try {
    const updateData: any = { status };
    if (referenceId) {
      updateData.reference_id = referenceId;
    }

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId);

    if (error) {
      console.error('Error updating transaction status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update transaction status:', error);
    return false;
  }
}

/**
 * Subscribe to transaction changes (realtime)
 */
export function subscribeToTransactions(callback: (payment: Payment) => void) {
  const channel = supabase
    .channel('transactions-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions',
      },
      (payload) => {
        console.log('Transaction changed:', payload);
        if (payload.new) {
          const tx = payload.new as SupabaseTransaction;
          const payment: Payment = {
            id: tx.id,
            description: tx.description || 'No description',
            amount: tx.amount,
            date: new Date(tx.date),
            status: tx.status,
            type: tx.type,
            method: (tx.method || 'Credit Card') as Payment['method'],
          };
          callback(payment);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
