import { PaymentFlow } from "../payment-flow";
import { getPaymentOrderById } from "../../../../lib/payments";

export default async function RazorpayPage({ params }: { params: { orderId: string } }) {
  const order = await getPaymentOrderById(params.orderId).catch(() => null);
  return <PaymentFlow variant="razorpay" order={order} />;
}
