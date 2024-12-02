export const getCartQuantity = (cart) => {
  let cartQuantity = 0;
  cart?.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  })

  return cartQuantity;
}

export const getCheckoutPricesCents = (orderItems, shippingPriceCents, percentTax) => {
  let itemsPriceCents = 0;

  orderItems.forEach((item) => {
    itemsPriceCents += item.priceCents * item.quantity;
  });

  const taxPriceCents = Math.round((itemsPriceCents * percentTax / 100).toFixed(3));
  const totalPriceCents = itemsPriceCents + shippingPriceCents + taxPriceCents;

  return { itemsPriceCents, shippingPriceCents, taxPriceCents, totalPriceCents, percentTax };
};