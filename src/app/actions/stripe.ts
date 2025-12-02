
'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Stripe from 'stripe';

export async function createCheckoutSession(formData: FormData) {
  const expenseId = formData.get('expenseId') as string;
  const expenseDescription = formData.get('expenseDescription') as string;
  const expenseAmount = formData.get('expenseAmount') as string;
  const expenseVehicleId = formData.get('expenseVehicleId') as string;
  const expenseType = formData.get('expenseType') as string;

  // Validate required fields only
  if (!expenseId || !expenseDescription || !expenseAmount) {
    console.error('Missing expense data:', { expenseId, expenseDescription, expenseAmount, expenseVehicleId, expenseType });
    throw new Error('Missing required expense data (ID, description, or amount).');
  }

  const amountInCents = Math.round(parseFloat(expenseAmount) * 100);
  if (isNaN(amountInCents)) {
    throw new Error('Invalid expense amount.');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  const host = headers().get('host') || 'localhost:9002';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const appUrl = `${protocol}://${host}`;

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: expenseDescription,
            description: `Expense ID: ${expenseId}`,
            metadata: {
              expenseId: expenseId,
              vehicleId: expenseVehicleId || 'N/A',
              expenseType: expenseType || 'General',
            },
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/expenses?success=true&expense_id=${expenseId}`,
    cancel_url: `${appUrl}/expenses?canceled=true&expense_id=${expenseId}`,
    client_reference_id: expenseId,
    metadata: {
      expenseId: expenseId,
      type: 'expense_payment',
    },
  });

  if (!checkoutSession.url) {
    throw new Error('Could not create Stripe checkout session');
  }

  redirect(checkoutSession.url);
}

/**
 * Create Stripe checkout session for pending transaction payment
 */
export async function createTransactionCheckoutSession(formData: FormData) {
  const transactionId = formData.get('transactionId') as string;
  const transactionDescription = formData.get('transactionDescription') as string;
  const transactionAmount = formData.get('transactionAmount') as string;
  const transactionType = formData.get('transactionType') as string;

  if (!transactionId || !transactionDescription || !transactionAmount) {
    throw new Error('Incomplete transaction data provided.');
  }

  const amountInCents = Math.round(parseFloat(transactionAmount) * 100);
  if (isNaN(amountInCents)) {
    throw new Error('Invalid transaction amount.');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  const host = headers().get('host') || 'localhost:9002';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const appUrl = `${protocol}://${host}`;

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd', // Changed to USD to allow smaller amounts
          product_data: {
            name: transactionDescription,
            description: `Transaction ID: ${transactionId}`,
            metadata: {
              transactionId: transactionId,
              transactionType: transactionType,
            },
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/payments?success=true&transaction_id=${transactionId}`,
    cancel_url: `${appUrl}/payments?canceled=true&transaction_id=${transactionId}`,
    client_reference_id: transactionId,
    metadata: {
      transactionId: transactionId,
      type: 'transaction_payment',
    },
  });

  if (!checkoutSession.url) {
    throw new Error('Could not create Stripe checkout session');
  }

  redirect(checkoutSession.url);
}
