import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json(
        { success: false, message: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Verify HMAC signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return Response.json(
        { success: false, message: 'Payment service not configured' },
        { status: 500 }
      );
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest('hex');

    if (digest !== razorpay_signature) {
      return Response.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
