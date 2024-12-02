import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({ baseUrl: '/api/v1', credentials: 'include' });

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)
    if (result.error && result.error.status === 401) {
      location.href = "/login";
    }
    return result
  },
  tagTypes: ["Orders", "AdminOrders"],
  endpoints: (builder) => ({
    createNewOrder: builder.mutation({
      query(body) {
        return {
          url: "/orders/new",
          method: "POST",
          body,
        };
      },
    }),
    myOrders: builder.query({
      query: ({ startDate, endDate }) => `/me/orders/?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ["Orders"]
    }),
    orderDetails: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: ["Orders", "AdminOrders"]
    }),
    stripeCheckoutSession: builder.mutation({
      query(body) {
        return {
          url: "/payment/checkout_session",
          method: "POST",
          body,
        };
      },
    }),
    getDashboardSales: builder.query({
      query: ({ startDate, endDate, tzString }) =>
        `/admin/get_sales/?startDate=${startDate}&endDate=${endDate}&tzString=${tzString}`,
    }),
    getAdminOrders: builder.query({
      query: ({ startDate, endDate }) => `/admin/orders/?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ["AdminOrders"],
    }),
    updateOrder: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/orders/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Orders", "AdminOrders"],
    }),
    deleteOrder: builder.mutation({
      query(id) {
        return {
          url: `/admin/orders/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Orders", "AdminOrders"],
    }),
  }),
});

export const {
  useCreateNewOrderMutation,
  useStripeCheckoutSessionMutation,
  useLazyMyOrdersQuery,
  useOrderDetailsQuery,
  useLazyGetDashboardSalesQuery,
  useLazyGetAdminOrdersQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = orderApi;
