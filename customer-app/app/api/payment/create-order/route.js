import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, cartItems, subtotal, shipping, user, shippingAddress } = body;

    // Create Razorpay order
    const options = {
      amount: amount, // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        items: cartItems.length,
        subtotal,
        shipping,
        customer_name: user?.name,
        customer_email: user?.email,
        shipping_city: shippingAddress?.city,
      },
    };

    const order = await razorpay.orders.create(options);

    return Response.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
