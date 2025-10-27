# FleetNow Admin App - Setup Guide

## 📋 Overview

The fn-admin app integrates with Supabase and Stripe for payment processing. Here's how it compares to passsengerv2:

### Payment Implementation Differences

| Feature | passsengerv2 (Mobile) | fn-admin (Desktop) |
|---------|----------------------|-------------------|
| **Architecture** | Edge Functions + Mobile SDK | Server Actions (Next.js) |
| **Stripe Integration** | Payment Intents via Edge Function | Checkout Sessions (redirect flow) |
| **Flow** | In-app payment with Stripe SDK | Redirect to Stripe hosted checkout |
| **Edge Functions** | ✅ Uses Supabase Edge Function | ❌ No Edge Functions (uses Server Actions) |
| **Real-time Updates** | Via Supabase subscription | Via Supabase subscription |

## 🔧 Setup Instructions

### 1. Navigate to Project Directory

```bash
cd /home/aura-04/fn-admin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Edit the `.env.local` file with your actual Stripe keys:

```bash
nano .env.local
```

Replace the placeholder Stripe keys with your actual test keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys):

```env
# Supabase Configuration (Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://jrgxheckjteefpavbhlm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ3hoZWNranRlZWZwYXZiaGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNzUzMjUsImV4cCI6MjA2MTY1MTMyNX0.Fzxv9kXu8_Hm3KwBvYQJ7WymZ8oYDL5H-KjP9L5YNTo

# Stripe Configuration - REPLACE THESE!
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Ruo9XK5B0t65NaX5KJUvS1t87KbtuyI2huQF4jYTLgONy4OEa0QBaAV82gXZ8WLQHrJcLCJqNkfUAxqyVNlDYyF00BOTF3Nb3
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here

# Application URL (for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

**Important**: Get your Stripe keys from the same Stripe account you used in passsengerv2 for consistency.

### 4. Run the Application

#### Option A: Web Version (Recommended for development)

```bash
npm run next:dev
```

Access at: http://localhost:9002

#### Option B: Electron Desktop App

```bash
npm run electron:dev
```

This will:
1. Start the Next.js dev server on port 9002
2. Launch the Electron desktop wrapper

## 💳 Payment Flow Comparison

### passsengerv2 (Mobile App)
1. User enters payment details in-app
2. App calls Supabase Edge Function `create-payment-intent`
3. Edge Function creates Stripe Payment Intent
4. Stripe React Native SDK processes payment
5. Payment status updated in Supabase
6. App shows success/failure

### fn-admin (Desktop App)
1. User clicks "Pay Now" on pending transaction
2. Server Action creates Stripe Checkout Session
3. User redirected to Stripe hosted checkout page
4. User completes payment on Stripe
5. Stripe redirects back to app with status
6. `PaymentStatusHandler` component updates transaction in Supabase
7. Real-time subscription updates UI

## 🔑 Why No Edge Functions in fn-admin?

The admin app **does not use Supabase Edge Functions** because:

1. **Next.js Server Actions** - More suitable for web/desktop apps
2. **Stripe Checkout Sessions** - Better for admin/desktop flows (hosted checkout)
3. **Simpler Architecture** - No need to deploy Edge Functions
4. **Same Database** - Both apps share the same Supabase database

### Using passsengerv2 Edge Functions (Optional)

If you want to use the existing Edge Function from passsengerv2:

1. The Edge Function is already deployed in your Supabase project
2. You can call it from fn-admin if needed:

```typescript
const response = await fetch(
  'https://jrgxheckjteefpavbhlm.supabase.co/functions/v1/create-payment-intent',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anon_key}`
    },
    body: JSON.stringify({ amount, currency, description })
  }
);
```

However, **the current implementation using Server Actions is preferred** for the admin desktop app.

## 🗄️ Database Setup

Both apps use the same Supabase database. Ensure your `transactions` table exists:

```sql
-- Check if transactions table exists
SELECT * FROM transactions LIMIT 5;
```

If not, create it:

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL, -- 'Incoming' or 'Outgoing'
  description TEXT,
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Completed', 'Failed'
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🧪 Testing Stripe Integration

### Test Cards (Same as passsengerv2)

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995

Use any future expiry date and any 3-digit CVC.

### Testing Flow

1. Run the app: `npm run next:dev`
2. Navigate to Payments page
3. Click "Pay Now" on a pending transaction
4. You'll be redirected to Stripe checkout
5. Enter test card details
6. Complete payment
7. You'll be redirected back to the app
8. Transaction status should update to "Completed"

## 🔄 Real-time Updates

Both apps use Supabase real-time subscriptions:

```typescript
// Listens to changes in transactions table
const subscription = supabase
  .channel('transactions')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'transactions' },
    handleChange
  )
  .subscribe();
```

This means:
- Changes in passsengerv2 will appear in fn-admin
- Changes in fn-admin will appear in passsengerv2
- Both apps stay in sync automatically

## 🚀 Production Deployment

### Update Environment Variables

```env
# Use production Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key

# Update app URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Build Electron App

```bash
npm run dist
```

This creates a distributable desktop app in the `dist/` folder.

## 📝 Key Files

- `src/app/actions/stripe.ts` - Stripe Server Actions (replaces Edge Functions)
- `src/lib/supabaseService.ts` - Supabase transaction operations
- `src/components/payments/payment-status-handler.tsx` - Handles Stripe redirects
- `src/components/payments/transaction-detail-card.tsx` - Pay Now button
- `src/contexts/app-data-context.tsx` - Real-time data management
- `.env.local` - Environment configuration

## ❓ FAQ

**Q: Do I need to deploy Edge Functions for fn-admin?**
A: No, fn-admin uses Next.js Server Actions instead.

**Q: Will payments work the same as passsengerv2?**
A: The end result is the same (payment recorded in Supabase), but the flow is different:
- passsengerv2: In-app payment with Payment Intents
- fn-admin: Redirect to Stripe hosted checkout with Checkout Sessions

**Q: Can both apps use the same Stripe account?**
A: Yes, they should use the same Stripe account for consistency.

**Q: How do I add the Stripe Secret Key?**
A: Copy it from https://dashboard.stripe.com/test/apikeys and paste it in `.env.local`

## 🆘 Troubleshooting

### "Stripe key not configured" error
- Check `.env.local` has valid Stripe keys
- Restart the dev server after updating env vars

### Payment redirect fails
- Verify `NEXT_PUBLIC_APP_URL` matches your actual URL
- Check Stripe dashboard for webhook/redirect errors

### Real-time updates not working
- Verify Supabase connection
- Check browser console for subscription errors
- Ensure `transactions` table has proper permissions

## 📚 Additional Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
