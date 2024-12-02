import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],

  shippingInfo: localStorage.getItem("shippingInfo")
    ? JSON.parse(localStorage.getItem("shippingInfo"))
    : {},

  deliveryOptions: localStorage.getItem("deliveryOptions")
    ? JSON.parse(localStorage.getItem("deliveryOptions"))
    : {},

  paymentAmountsCents: localStorage.getItem("paymentAmountsCents")
    ? JSON.parse(localStorage.getItem("paymentAmountsCents"))
    : {},

  checkoutError: localStorage.getItem("checkoutError")
    ? JSON.parse(localStorage.getItem("checkoutError"))
    : {},
};

export const cartSlice = createSlice({
  initialState,
  name: "cartSlice",
  reducers: {
    setCartItem: (state, action) => {
      const item = action.payload;

      const isItemExist = state.cartItems.find(
        (i) => i.productId === item.productId
      );

      if (isItemExist) {
        state.cartItems = state.cartItems.map((i) =>
          i.productId === isItemExist.productId ? item : i
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));

      state.deliveryOptions = {};
      localStorage.removeItem("deliveryOptions");

      delete state.shippingInfo?.deliveryOption;
      localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
    },
    removeCartItem: (state, action) => {
      state.cartItems = state?.cartItems?.filter(
        (i) => i.productId !== action.payload
      );

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));

      state.deliveryOptions = {};
      localStorage.removeItem("deliveryOptions");

      delete state.shippingInfo?.deliveryOption;
      localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
    },
    clearCart: (state, action) => {
      state.cartItems = [];
      localStorage.removeItem("cartItems");

      state.deliveryOptions = {};
      localStorage.removeItem("deliveryOptions");

      delete state.shippingInfo?.deliveryOption;
      localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
    },
    replaceCart: (state, action) => {
      state.cartItems = action.payload;
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));

      state.deliveryOptions = {};
      localStorage.removeItem("deliveryOptions");

      delete state.shippingInfo?.deliveryOption;
      localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
    },
    saveShippingInfo: (state, action) => {
      state.shippingInfo = action.payload;
      localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
    },
    savePaymentAmountsCents: (state, action) => {
      state.paymentAmountsCents = action.payload;
      localStorage.setItem("paymentAmountsCents", JSON.stringify(state.paymentAmountsCents));
    },
    saveDeliveryOptions: (state, action) => {
      state.deliveryOptions = action.payload;
      localStorage.setItem("deliveryOptions", JSON.stringify(state.deliveryOptions));
    },
    deleteDeliveryOptions: (state, action) => {
      state.deliveryOptions = {};
      localStorage.removeItem("deliveryOptions");

      delete state.shippingInfo?.deliveryOption;
      localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
    },
    replaceCheckoutError: (state, action) => {
      state.checkoutError = action.payload;
      localStorage.setItem("checkoutError", JSON.stringify(state.checkoutError));
    },
  },
});

export default cartSlice.reducer;

export const { setCartItem, removeCartItem, clearCart, replaceCart, saveShippingInfo, savePaymentAmountsCents, saveDeliveryOptions, deleteDeliveryOptions, replaceCheckoutError } =
  cartSlice.actions;
