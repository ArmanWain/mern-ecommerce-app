import { domesticDeliveryOptions, internationalDeliveryOptions } from "../data/deliveryOptions.js";

export const getDeliveryOptions = (cartItems, shippingInfo) => {
  let deliveryOptions;

  if (shippingInfo?.country === "Canada") {
    deliveryOptions = JSON.parse(domesticDeliveryOptions);
  } else {
    deliveryOptions = JSON.parse(internationalDeliveryOptions);
  }

  let itemsPriceCents = 0;
  cartItems.forEach((item) => {
    itemsPriceCents += item?.quantity * item?.priceCents;
  });

  if (itemsPriceCents >= 3000) {
    deliveryOptions = deliveryOptions.map((option) => {
      // Free shipping for delivery option 1
      if (option.id === 1) {
        return { ...option, priceCents: 0 };
      }

      // Lower price of all other delivery options by $5
      if (option.priceCents - 500 > 0) {
        return { ...option, priceCents: option.priceCents - 500 };
      } else {
        return { ...option, priceCents: 0 };
      }
    });
  };

  return deliveryOptions;
};