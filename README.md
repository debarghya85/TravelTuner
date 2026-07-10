# TravelTuner

## Razorpay Webhook Setup

TravelTuner supports Razorpay webhooks in both local development and production without code changes. The app detects the environment using `NODE_ENV`.

### Webhook endpoint

The webhook endpoint is:

```text
/api/webhooks/razorpay
```

The legacy route `/api/payments/webhook/razorpay` is kept as a compatibility alias.

## Hosted Razorpay Checkout

TravelTuner now opens Razorpay's hosted Checkout overlay directly from the itinerary form.

### Flow

1. User submits the itinerary form.
2. The app calls `POST /api/payment/create-order`.
3. The server creates a Razorpay order and returns:
   - `order_id`
   - `amount`
   - `currency`
   - `key_id`
4. The frontend opens Razorpay Checkout using the hosted overlay.
5. Razorpay returns the payment response to the browser.
6. The app sends that response to `POST /api/payment/verify`.
7. The server verifies the signature, saves the payment, and starts AI generation.

### API endpoints

- `POST /api/payment/create-order`
- `POST /api/payment/verify`
- `POST /api/payment/refund`
- `POST /api/webhooks/razorpay`

### Environment variables

Use these variables in both environments:

```env
# Application
USER_SESSION_SECRET=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# Webhook verification
PAYMENT_WEBHOOK_SECRET=

# Optional local override for webhook URL documentation
RAZORPAY_WEBHOOK_URL=

# Environment
NODE_ENV=development
```

### Local development with ngrok

1. Install ngrok.
2. Start the Next.js app.
3. Run:

```bash
ngrok http 3000
```

4. Copy the HTTPS forwarding URL from ngrok.
5. Configure the Razorpay dashboard webhook URL as:

```text
https://<ngrok-url>/api/webhooks/razorpay
```

6. Use the same `PAYMENT_WEBHOOK_SECRET` value in your Razorpay dashboard and local environment.
7. Perform test payments in Razorpay Test Mode.

Important:

- Razorpay will need the current ngrok URL whenever it changes.
- The app does not hardcode ngrok. In development, webhook URL selection can be documented or overridden with `RAZORPAY_WEBHOOK_URL` if you want to keep the current ngrok address in your local environment.

### Production setup

Deploy the app to Netlify and configure the Razorpay dashboard webhook URL as:

```text
https://travel-tuner.netlify.app/api/webhooks/razorpay
```

Use the production `PAYMENT_WEBHOOK_SECRET` value in Netlify environment variables and Razorpay.

### Supported webhook events

The webhook handler processes:

- `payment.captured`
- `payment.failed`
- `order.paid`
- `refund.processed`

Unknown events are ignored safely.

### What the webhook updates

Successful payment events:

- mark the payment as successful
- store payment ID, order ID, signature, amount, currency, payment method, and timestamp
- queue itinerary generation once per event

Failed payment events:

- mark the payment as failed
- store the failure reason when available

Refund events:

- mark the payment as refunded
- store refund details

### Idempotency

Webhook processing is idempotent.

The system stores processed webhook events and skips duplicates, so repeated deliveries do not:

- create duplicate payment records
- regenerate itineraries twice
- issue duplicate refunds

### Security

The webhook handler:

- accepts POST requests only
- reads the raw request body for signature verification
- verifies the Razorpay signature using `PAYMENT_WEBHOOK_SECRET`
- rejects invalid signatures with HTTP 400
- handles malformed JSON safely
- never exposes secrets to the frontend

## Development

```bash
npm install
npm run dev
```

The frontend opens Razorpay Checkout directly. No custom payment page is required.

## Production

Set `NODE_ENV=production` and configure these environment variables in Netlify:

```env
USER_SESSION_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
PAYMENT_WEBHOOK_SECRET=
NODE_ENV=production
```

The Razorpay webhook URL must point to:

```text
https://travel-tuner.netlify.app/api/webhooks/razorpay
```
