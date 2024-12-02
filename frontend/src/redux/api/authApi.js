import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userApi } from "./userApi";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1', credentials: 'include' }),
  endpoints: (builder) => ({
    register: builder.mutation({
      query(body) {
        return {
          url: "/register",
          method: "POST",
          body,
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Get user information if registration is successful
          await dispatch(userApi.endpoints.getMe.initiate(null));
        } catch (error) {
          if (error.message) {
            console.log(error.message);
          }
        }
      },
    }),
    login: builder.mutation({
      query(body) {
        return {
          url: "/login",
          method: "POST",
          body,
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Get user information if login is successful
          await dispatch(userApi.endpoints.getMe.initiate(null));
        } catch (error) {
          if (error.message) {
            console.log(error.message);
          }
        }
      },
    }),
    logout: builder.query({
      query: () => "/logout",
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLazyLogoutQuery } =
  authApi;
