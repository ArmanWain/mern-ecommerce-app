import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import { ErrorHandler } from "../utils/errors.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import { verifyItems, verifyPaymentAmounts } from "../utils/checkout.js";
import { reserveStock, returnStock } from "../utils/stock.js";
import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create stripe checkout session   =>  /api/v1/payment/checkout_session
export const stripeCheckoutSession = catchAsyncErrors(async (req, res, next) => {
  const { orderItems, shippingInfo, paymentInfo, } = req.body;

  // Filter items with a quantity greater than zero
  const filteredOrderItems = orderItems.filter((orderItem) => orderItem.quantity > 0);

  if (!filteredOrderItems.length) {
    return next(new ErrorHandler("Your cart is empty", 400, { cartEmpty: true }));
  }

  let actualItems = [];
  let actualItemsPriceCents = 0;

  // Get actual items
  for (let i = 0; i < filteredOrderItems.length; i++) {
    const actualItem = await Product.findById(filteredOrderItems[i].productId);

    if (!actualItem) {
      continue;
    }

    actualItemsPriceCents += actualItem.priceCents * orderItems[i].quantity;

    actualItems.push(actualItem);
  }

  // Verify items
  const itemError = await verifyItems(filteredOrderItems, actualItems);

  if (itemError) {
    return next(itemError);
  }

  // Verify payment amounts
  const paymentError = await verifyPaymentAmounts(shippingInfo, paymentInfo, actualItemsPriceCents);

  if (paymentError) {
    return next(paymentError);
  }

  // Reserve items
  const reserveError = await reserveStock(filteredOrderItems, actualItems);

  if (reserveError) {
    return next(reserveError);
  }

  try {
    // Create Stripe line items
    const line_items = filteredOrderItems.map((item) => {
      return {
        price_data: {
          currency: "cad",
          product_data: {
            name: item?.name,
            images: [item?.image],
            metadata: { productId: item?.productId },
          },
          unit_amount: item?.priceCents,
        },
        tax_rates: ["txr_1QIJmPArESc5f0dcnMRBOgN7"],
        quantity: item?.quantity,
      };
    });

    // Create Stripe delivery option
    const deliveryOption = shippingInfo.deliveryOption;

    let deliveryOptionName = deliveryOption.name;

    if (deliveryOption.priceCents === 0) {
      deliveryOptionName = "FREE " + deliveryOptionName;
    }

    const stripeDeliveryOption = {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          amount: deliveryOption.priceCents,
          currency: "cad",
        },
        display_name: deliveryOptionName,
      }
    };

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${process.env.FRONTEND_URL}/me/orders?order_success=true`,
      cancel_url: `${process.env.FRONTEND_URL}`,
      customer_email: req?.user?.email,
      client_reference_id: req?.user?._id?.toString(),
      mode: "payment",
      metadata: { shippingInfo: JSON.stringify(shippingInfo), itemsPriceCents: paymentInfo?.amounts?.itemsPriceCents },
      shipping_options: [stripeDeliveryOption],
      line_items,
    });

    res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    returnStock(filteredOrderItems);

    return next(new ErrorHandler(error.message, 500, { backendError: true }, error.name));
  }
}
);

const getOrderItems = async (line_items) => {
  return new Promise((resolve, reject) => {
    let orderItems = [];

    line_items?.data?.forEach(async (item) => {
      const product = await stripe.products.retrieve(item.price.product);
      const productId = product.metadata.productId;

      orderItems.push({
        productId,
        name: product.name,
        priceCents: item.price.unit_amount,
        quantity: item.quantity,
        image: product.images[0],
      });

      if (orderItems.length === line_items?.data?.length) {
        resolve(orderItems);
      }
    });
  });
};

// Handle Stripe webhook events   =>  /api/v1/payment/webhook
export const stripeWebhook = catchAsyncErrors(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];

  const event = stripe.webhooks.constructEvent(
    req.rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "checkout.session.completed") {
    // Create new order
    const session = event.data.object;

    const line_items = await stripe.checkout.sessions.listLineItems(session.id);

    const orderItems = await getOrderItems(line_items);
    const user = session.client_reference_id;

    const itemsPriceCents = session.metadata.itemsPriceCents;
    const shippingPriceCents = session.total_details.amount_shipping;
    const taxAmountCents = session.total_details.amount_tax;
    const totalAmountCents = session.amount_total;

    const shippingInfo = JSON.parse(session.metadata.shippingInfo);

    const paymentInfo = {
      id: session.payment_intent,
      status: "Paid",
      method: "Card",
      amounts: {
        itemsPriceCents,
        shippingPriceCents,
        taxAmountCents,
        totalAmountCents,
      }
    };

    const orderData = {
      orderItems,
      shippingInfo,
      paymentInfo,
      user,
    };

    try {
      await Order.create(orderData);

      res.status(201).json({ success: true });
    } catch (error) {
      // Return reserved items to stock
      returnStock(orderItems);

      return next(new ErrorHandler(error.message, 500, { backendError: true }, error.name));
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;

    const line_items = await stripe.checkout.sessions.listLineItems(session.id);

    const orderItems = await getOrderItems(line_items);

    // Return reserved items to stock
    returnStock(orderItems);

    res.status(200).json({ success: true });
  }
});
