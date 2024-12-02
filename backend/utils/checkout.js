import { domesticDeliveryOptions, internationalDeliveryOptions } from "../data/deliveryOptions.js";
import { ErrorHandler, addError } from "./errors.js";

export const verifyItems = async (orderItems, actualItems) => {
  let itemErrors = [];

  // Verify item information
  for (let i = 0; i < orderItems.length; i++) {
    const actualItem = actualItems.find((item) => item._id.toHexString() === orderItems[i].productId);

    // Create error if product not found
    if (!actualItem) {
      orderItems[i].errors = {
        productNotFound: true
      }

      itemErrors.push({
        productId: orderItems[i].productId,
        errorCount: 1
      });

      continue;
    }

    // Create error if names do not match
    if (actualItem.name !== orderItems[i].name) {
      orderItems[i].errors = {
        incorrectName: true
      }

      orderItems[i].name = actualItem.name;

      itemErrors.push({
        productId: orderItems[i].productId,
        errorCount: 1
      });
    }

    // Create error if descriptions do not match
    if (actualItem.description !== orderItems[i].description) {
      orderItems[i].errors = {
        ...orderItems[i].errors,
        incorrectDescription: true
      }

      orderItems[i].description = actualItem.description;

      itemErrors = addError(orderItems[i].productId, itemErrors);
    }

    // Create error if prices do not match
    if (actualItem.priceCents !== orderItems[i].priceCents) {
      orderItems[i].errors = {
        ...orderItems[i].errors,
        incorrectPriceCents: orderItems[i].priceCents
      }

      orderItems[i].priceCents = actualItem.priceCents;

      itemErrors = addError(orderItems[i].productId, itemErrors);
    }

    // Create error if there is not enough stock
    if (actualItem.stock < orderItems[i].quantity && actualItem.stock === 0) {
      orderItems[i].errors = {
        ...orderItems[i].errors,
        noStock: true
      }

      itemErrors = addError(orderItems[i].productId, itemErrors);
    } else if (actualItem.stock < orderItems[i].quantity) {
      orderItems[i].errors = {
        ...orderItems[i].errors,
        notEnoughStock: true
      }

      itemErrors = addError(orderItems[i].productId, itemErrors);
    }
  }

  // Response if there is one error in one item
  if (itemErrors.length === 1 && itemErrors[0].errorCount === 1) {
    return new ErrorHandler("An item in your cart has changed. Please confirm the change before continuing with your purchase.", 400, { itemsChanged: { updatedItems: orderItems } });
  }

  // Response if there is more than one error in one item
  if (itemErrors.length === 1) {
    return new ErrorHandler("An item in your cart has changed. Please confirm the changes before continuing with your purchase.", 400, { itemsChanged: { updatedItems: orderItems } });
  }

  // Response if multiple items have errors
  if (itemErrors.length > 1) {
    return new ErrorHandler("Items in your cart have changed. Please confirm the changes before continuing with your purchase.", 400, { itemsChanged: { updatedItems: orderItems } });
  }
};

export const verifyPaymentAmounts = async (shippingInfo, paymentInfo, actualItemsPriceCents) => {
  // Find delivery option
  let actualDeliveryOption;

  if (shippingInfo?.country === "Canada") {
    actualDeliveryOption = JSON.parse(domesticDeliveryOptions).find((option) => option.id === shippingInfo?.deliveryOption?.id);
  } else {
    actualDeliveryOption = JSON.parse(internationalDeliveryOptions).find((option) => option.id === shippingInfo?.deliveryOption?.id);
  }

  if (!actualDeliveryOption || actualDeliveryOption.name !== shippingInfo?.deliveryOption?.name) {
    return new ErrorHandler("The selected delivery option is invalid", 400, { incorrectDeliveryOption: true });
  }

  // Adjust delivery price based on items price
  if (actualItemsPriceCents >= 3000 && actualDeliveryOption.id === 1) {
    actualDeliveryOption.priceCents = 0;
  } else if (actualItemsPriceCents >= 3000) {
    actualDeliveryOption.priceCents = actualDeliveryOption.priceCents - 500;
  }

  if (actualDeliveryOption.priceCents < 0) {
    actualDeliveryOption.priceCents = 0;
  }

  // Get tax percent
  const percentTax = 13;

  // Calculate order prices
  const actualTaxAmountCents = Math.round((actualItemsPriceCents * (percentTax / 100)).toFixed(3));
  const actualTotalAmountCents = actualItemsPriceCents + actualDeliveryOption.priceCents + actualTaxAmountCents;

  // Verify payment amounts
  const { itemsPriceCents, shippingPriceCents, taxAmountCents, totalAmountCents } = paymentInfo?.amounts;

  if (itemsPriceCents !== actualItemsPriceCents ||
    shippingPriceCents !== actualDeliveryOption.priceCents ||
    taxAmountCents !== actualTaxAmountCents ||
    totalAmountCents !== actualTotalAmountCents) {

    return new ErrorHandler("There was an error processing your request", 400, { incorrectPaymentAmount: true });
  }
}