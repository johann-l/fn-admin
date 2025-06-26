
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

  if (!expenseId || !expenseDescription || !expenseAmount || !expenseVehicleId || !expenseType) {
    throw new Error('Incomplete expense data provided.');
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
            metadata: {
              vehicleId: expenseVehicleId,
              expenseType: expenseType,
            },
          },
          unit_amount: amountInCents,
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
