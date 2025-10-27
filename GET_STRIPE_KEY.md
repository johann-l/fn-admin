# Get Your Stripe Secret Key

The admin app needs your **Stripe Secret Key** to create checkout sessions.

## Option 1: Get from Stripe Dashboard (Recommended)

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Click "Reveal test key" under "Secret key"
3. Copy the key (starts with `sk_test_`)
4. Update `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_your_copied_key_here
   ```

## Option 2: Get from Supabase Edge Function Environment

If you already set it up for your mobile app:

1. Go to: https://supabase.com/dashboard/project/jrgxheckjteefpavbhlm/functions
2. Click on `create-payment-intent` function
3. Check the "Secrets" tab
4. Copy the value of `STRIPE_SECRET_KEY`
5. Update `.env.local` with that value

## After Adding the Key

1. **Restart the dev server**:
   ```bash
   # Press Ctrl+C to stop the current server, then:
   npm run next:dev
   ```

2. **Test the payment flow**:
   - Login to the app
   - Go to Payments page
   - Click "Pay Now" on a pending transaction
   - You should be redirected to Stripe checkout

## Test Card for Payments

When redirected to Stripe, use this test card:
- **Card number**: 4242 4242 4242 4242
- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

---

**Current Status:**
- ✅ Supabase keys configured
- ✅ Stripe publishable key configured
- ⚠️ Stripe secret key needs to be added
