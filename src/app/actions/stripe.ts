'use server';

import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { expenses } from '@/lib/data';

export async function createCheckoutSession(formData: FormData) {
  const expenseId = formData.get('expenseId') as string;
  if (!expenseId) {
    throw new Error('Expense ID is required');
  }
  
  const expense = expenses.find((e) => e.id === expenseId);
  if (!expense) {
    throw new Error('Expense not found');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: expense.description,
            metadata: {
              vehicleId: expense.vehicleId,
              expenseType: expense.type,
            },
          },
          unit_amount: Math.round(expense.amount * 100), // amount in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/expenses?success=true&expense_id=${expenseId}`,
    cancel_url: `${appUrl}/expenses?canceled=true`,
    client_reference_id: expenseId,
  });

  if (!checkoutSession.url) {
    throw new Error('Could not create Stripe checkout session');
  }

  redirect(checkoutSession.url);
}
