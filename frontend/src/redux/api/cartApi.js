import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({ baseUrl: '/api/v1', credentials: 'include' });

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)
    if (result.error && result.error.status === 401) {
      location.href = "/login";
    }
    return result
  },
  endpoints: (builder) => ({
    getCheckoutDetails: builder.query({
      query(body) {
        return {
          url: "/cart/checkout_details",
          method: "POST",
          body,
        };
      },
    }),
    canAddToCart: builder.mutation({
      query(body) {
        return {
          url: `/cart/${body?.id}`,
          method: "POST",
          body
        };
      },
    }),
    verifyCart: builder.mutation({
      query(body) {
        return {
          url: "/cart/verify",
          method: "POST",
          body
        };
      },
    }),
    canProceedWithCheckout: builder.mutation({
      query(body) {
        return {
          url: "/cart/can_proceed",
          method: "POST",
          body
        };
      },
    }),
  }),
});

export const { useLazyGetCheckoutDetailsQuery, useCanAddToCartMutation, useVerifyCartMutation, useCanProceedWithCheckoutMutation } = cartApi;
