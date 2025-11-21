// lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);



// switch (err.type) {
//   case 'StripeCardError':
//     // A declined card error
//     err.message; // => e.g. "Your card's expiration year is invalid."
//     break;
//   case 'StripeRateLimitError':
//     // Too many requests made to the API too quickly
//     break;
//   case 'StripeInvalidRequestError':
//     // Invalid parameters were supplied to Stripe's API
//     break;
//   case 'StripeAPIError':
//     // An error occurred internally with Stripe's API
//     break;
//   case 'StripeConnectionError':
//     // Some kind of error occurred during the HTTPS communication
//     break;
//   case 'StripeAuthenticationError':
//     // You probably used an incorrect API key
//     break;
//   default:
//     // Handle any other types of unexpected errors
//     break;
// }

export { stripe };

// // Create a checkout session for one-time payment
// export async function createCheckoutSession(
//   amount: number,
//   customerEmail: string,
//   userId: string,
//   successUrl: string,
//   cancelUrl: string
// ) {
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     customer_email: customerEmail,
//     client_reference_id: userId,
//     line_items: [
//       {
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: 'Payment',
//           },
//           unit_amount: Math.round(amount * 100),
//         },
//         quantity: 1,
//       },
//     ],
//     mode: 'payment',
//     success_url: successUrl,
//     cancel_url: cancelUrl,
//   });

//   return session;
// }

// // Create a checkout session for subscription
// export async function createSubscriptionCheckoutSession(
//   priceId: string,
//   customerEmail: string,
//   userId: string,
//   successUrl: string,
//   cancelUrl: string
// ) {
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     customer_email: customerEmail,
//     client_reference_id: userId,
//     line_items: [
//       {
//         price: priceId,
//         quantity: 1,
//       },
//     ],
//     mode: 'subscription',
//     success_url: successUrl,
//     cancel_url: cancelUrl,
//   });

//   return session;
// }

// // Retrieve customer and their payment methods
// export async function getCustomerPaymentMethods(customerId: string) {
//   const paymentMethods = await stripe.paymentMethods.list({
//     customer: customerId,
//     type: 'card',
//   });

//   return paymentMethods.data;
// }

// // Create a Stripe customer
// export async function createCustomer(email: string, name?: string) {
//   const customer = await stripe.customers.create({
//     email,
//     name,
//   });

//   return customer;
// }

// // Get or create customer
// export async function getOrCreateCustomer(
//   email: string,
//   name?: string
// ) {
//   const customers = await stripe.customers.list({
//     email,
//     limit: 1,
//   });

//   if (customers.data.length > 0) {
//     return customers.data[0];
//   }

//   return createCustomer(email, name);
// }

// // Cancel subscription
// export async function cancelSubscription(subscriptionId: string) {
//   const subscription = await stripe.subscriptions.del(subscriptionId);
//   return subscription;
// }

// // Update payment method for subscription
// export async function updateSubscriptionPaymentMethod(
//   subscriptionId: string,
//   paymentMethodId: string
// ) {
//   const subscription = await stripe.subscriptions.update(subscriptionId, {
//     default_payment_method: paymentMethodId,
//   });
//   return subscription;
// }

// // ============================================================================
// // API ROUTES
// // ============================================================================

// // app/api/create-checkout-session/route.ts
// import { createCheckoutSession } from '@/lib/stripe';

// export async function POST(request: Request) {
//   try {
//     const { amount, email, userId, successUrl, cancelUrl } = await request.json();

//     if (!amount || !email || !userId) {
//       return Response.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     const session = await createCheckoutSession(
//       amount,
//       email,
//       userId,
//       successUrl,
//       cancelUrl
//     );

//     return Response.json({ url: session.url });
//   } catch (error) {
//     console.error('Checkout session error:', error);
//     return Response.json(
//       { error: (error as Error).message },
//       { status: 400 }
//     );
//   }
// }

// // ============================================================================

// // app/api/create-subscription-session/route.ts
// import { createSubscriptionCheckoutSession } from '@/lib/stripe';

// export async function POST(request: Request) {
//   try {
//     const { priceId, email, userId, successUrl, cancelUrl } = await request.json();

//     if (!priceId || !email || !userId) {
//       return Response.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     const session = await createSubscriptionCheckoutSession(
//       priceId,
//       email,
//       userId,
//       successUrl,
//       cancelUrl
//     );

//     return Response.json({ url: session.url });
//   } catch (error) {
//     console.error('Subscription session error:', error);
//     return Response.json(
//       { error: (error as Error).message },
//       { status: 400 }
//     );
//   }
// }

// // ============================================================================

// // app/api/webhooks/stripe/route.ts
// import { stripe } from '@/lib/stripe';
// import { headers } from 'next/headers';

// // Store these functions or make API calls to update your database
// async function handlePaymentSuccess(sessionId: string, customerId: string, userId: string) {
//   console.log(`Payment successful for user ${userId}`);
//   // TODO: Update your database to mark order as paid
//   // await db.order.update({ where: { userId }, data: { status: 'paid' } });
// }

// async function handlePaymentFailed(sessionId: string, userId: string) {
//   console.log(`Payment failed for user ${userId}`);
//   // TODO: Update your database to mark order as failed
//   // await db.order.update({ where: { userId }, data: { status: 'failed' } });
// }

// async function handleSubscriptionCreated(subscription: any) {
//   console.log(`Subscription created: ${subscription.id}`);
//   const userId = subscription.metadata?.userId;
//   // TODO: Save subscription to database
//   // await db.subscription.create({
//   //   stripeSubscriptionId: subscription.id,
//   //   userId,
//   //   status: subscription.status,
//   // });
// }

// async function handleSubscriptionUpdated(subscription: any) {
//   console.log(`Subscription updated: ${subscription.id}`);
//   const userId = subscription.metadata?.userId;
//   // TODO: Update subscription in database
// }

// async function handleSubscriptionDeleted(subscription: any) {
//   console.log(`Subscription deleted: ${subscription.id}`);
//   const userId = subscription.metadata?.userId;
//   // TODO: Mark subscription as cancelled in database
// }

// async function handleInvoicePaid(invoice: any) {
//   console.log(`Invoice paid: ${invoice.id}`);
//   const subscriptionId = invoice.subscription;
//   // TODO: Update invoice/payment status in database
// }

// async function handleInvoiceFailed(invoice: any) {
//   console.log(`Invoice failed: ${invoice.id}`);
//   // TODO: Handle failed invoice - retry, notify user, etc.
// }

// export async function POST(request: Request) {
//   const body = await request.text();
//   const headersList = await headers();
//   const sig = headersList.get('stripe-signature')!;

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );
//   } catch (error) {
//     console.error('Webhook signature verification failed:', error);
//     return Response.json(
//       { error: 'Invalid signature' },
//       { status: 400 }
//     );
//   }

//   try {
//     switch (event.type) {
//       // ONE-TIME PAYMENTS
//       case 'checkout.session.completed': {
//         const session = event.data.object as any;
//         const userId = session.client_reference_id;
//         const customerId = session.customer;

//         if (session.mode === 'payment') {
//           await handlePaymentSuccess(session.id, customerId, userId);
//         } else if (session.mode === 'subscription') {
//           // Subscription starts here
//           const subscription = await stripe.subscriptions.list({
//             customer: customerId,
//             limit: 1,
//           });

//           if (subscription.data.length > 0) {
//             await handleSubscriptionCreated({
//               ...subscription.data[0],
//               metadata: { userId },
//             });
//           }
//         }
//         break;
//       }

//       // SUBSCRIPTION EVENTS
//       case 'customer.subscription.created': {
//         const subscription = event.data.object as any;
//         await handleSubscriptionCreated(subscription);
//         break;
//       }

//       case 'customer.subscription.updated': {
//         const subscription = event.data.object as any;
//         await handleSubscriptionUpdated(subscription);
//         break;
//       }

//       case 'customer.subscription.deleted': {
//         const subscription = event.data.object as any;
//         await handleSubscriptionDeleted(subscription);
//         break;
//       }

//       // INVOICE EVENTS (for recurring payments)
//       case 'invoice.paid': {
//         const invoice = event.data.object as any;
//         await handleInvoicePaid(invoice);
//         break;
//       }

//       case 'invoice.payment_failed': {
//         const invoice = event.data.object as any;
//         await handleInvoiceFailed(invoice);
//         break;
//       }

//       case 'payment_intent.succeeded': {
//         const paymentIntent = event.data.object as any;
//         console.log(`Payment intent succeeded: ${paymentIntent.id}`);
//         break;
//       }

//       case 'payment_intent.payment_failed': {
//         const paymentIntent = event.data.object as any;
//         console.log(`Payment intent failed: ${paymentIntent.id}`);
//         await handlePaymentFailed(paymentIntent.id, paymentIntent.metadata?.userId);
//         break;
//       }

//       default:
//         console.log(`Unhandled event type: ${event.type}`);
//     }

//     return Response.json({ received: true });
//   } catch (error) {
//     console.error('Webhook handler error:', error);
//     return Response.json(
//       { error: 'Webhook handler failed' },
//       { status: 400 }
//     );
//   }
// }

// // ============================================================================
// // FRONTEND COMPONENTS
// // ============================================================================

// // components/PaymentButton.tsx
// 'use client';

// import { useRouter } from 'next/navigation';
// import { useState } from 'react';

// export function PaymentButton({
//   amount,
//   email,
//   userId,
// }: {
//   amount: number;
//   email: string;
//   userId: string;
// }) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   async function handlePayment() {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch('/api/create-checkout-session', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           amount,
//           email,
//           userId,
//           successUrl: `${window.location.origin}/payment-success`,
//           cancelUrl: `${window.location.origin}/payment-cancelled`,
//         }),
//       });

//       const data = await response.json();

//       if (data.error) {
//         setError(data.error);
//         return;
//       }

//       // Redirect to Stripe Checkout
//       router.push(data.url);
//     } catch (err) {
//       setError((err as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div>
//       {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
//       <button
//         onClick={handlePayment}
//         disabled={loading}
//         style={{
//           padding: '10px 20px',
//           backgroundColor: '#5469d4',
//           color: 'white',
//           border: 'none',
//           borderRadius: '4px',
//           cursor: loading ? 'not-allowed' : 'pointer',
//           opacity: loading ? 0.6 : 1,
//         }}
//       >
//         {loading ? 'Processing...' : `Pay $${amount}`}
//       </button>
//     </div>
//   );
// }

// // ============================================================================

// // components/SubscriptionButton.tsx
// 'use client';

// import { useRouter } from 'next/navigation';
// import { useState } from 'react';

// export function SubscriptionButton({
//   priceId,
//   email,
//   userId,
//   planName,
// }: {
//   priceId: string;
//   email: string;
//   userId: string;
//   planName: string;
// }) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   async function handleSubscription() {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch('/api/create-subscription-session', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           priceId,
//           email,
//           userId,
//           successUrl: `${window.location.origin}/subscription-success`,
//           cancelUrl: `${window.location.origin}/subscription-cancelled`,
//         }),
//       });

//       const data = await response.json();

//       if (data.error) {
//         setError(data.error);
//         return;
//       }

//       // Redirect to Stripe Checkout
//       router.push(data.url);
//     } catch (err) {
//       setError((err as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div>
//       {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
//       <button
//         onClick={handleSubscription}
//         disabled={loading}
//         style={{
//           padding: '10px 20px',
//           backgroundColor: '#5469d4',
//           color: 'white',
//           border: 'none',
//           borderRadius: '4px',
//           cursor: loading ? 'not-allowed' : 'pointer',
//           opacity: loading ? 0.6 : 1,
//         }}
//       >
//         {loading ? 'Processing...' : `Subscribe to ${planName}`}
//       </button>
//     </div>
//   );
// }

// // ============================================================================

// // app/payment-success/page.tsx
// export default function PaymentSuccess() {
//   return (
//     <div style={{ padding: '40px', textAlign: 'center' }}>
//       <h1>✓ Payment Successful!</h1>
//       <p>Thank you for your payment. Your transaction has been completed.</p>
//       <a href="/dashboard" style={{ color: '#5469d4' }}>
//         Back to Dashboard
//       </a>
//     </div>
//   );
// }

// // ============================================================================

// // app/payment-cancelled/page.tsx
// export default function PaymentCancelled() {
//   return (
//     <div style={{ padding: '40px', textAlign: 'center' }}>
//       <h1>✕ Payment Cancelled</h1>
//       <p>Your payment was cancelled. You can try again anytime.</p>
//       <a href="/" style={{ color: '#5469d4' }}>
//         Back Home
//       </a>
//     </div>
//   );
// }

// // ============================================================================

// // app/subscription-success/page.tsx
// export default function SubscriptionSuccess() {
//   return (
//     <div style={{ padding: '40px', textAlign: 'center' }}>
//       <h1>✓ Subscription Active!</h1>
//       <p>Your subscription is now active. Stripe will store your card for recurring charges.</p>
//       <a href="/dashboard" style={{ color: '#5469d4' }}>
//         Back to Dashboard
//       </a>
//     </div>
//   );
// }

// // ============================================================================

// // .env.local
// // STRIPE_SECRET_KEY=sk_test_...
// // STRIPE_WEBHOOK_SECRET=whsec_...
// // NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...