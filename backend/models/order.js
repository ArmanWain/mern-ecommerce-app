import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      phoneNo: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      deliveryOption: {
        id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        deliveryDays: {
          type: Number,
          required: true,
        }
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          max: 99,
          validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
          }
        },
        image: {
          type: String,
        },
        priceCents: {
          type: Number,
          required: true,
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    paymentInfo: {
      id: String,
      status: {
        type: String,
        required: true,
      },
      method: {
        type: String,
        required: [true, "Please select payment method"],
        enum: {
          values: ["COD", "Card"],
          message: "Please select COD or Card",
        }
      },
      amounts: {
        itemsPriceCents: {
          type: Number,
          required: true,
        },
        shippingPriceCents: {
          type: Number,
          required: true,
        },
        taxAmountCents: {
          type: Number,
          required: true,
        },
        totalAmountCents: {
          type: Number,
          required: true,
        },
      }
    },
    orderStatus: {
      type: String,
      enum: {
        values: ["Processing", "Shipped", "Delivered"],
        message: "Please select correct order status",
      },
      default: "Processing",
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
