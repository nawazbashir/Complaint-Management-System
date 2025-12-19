import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  accessToken: string
  user: {
    id: number
    name: string
    role: string
  }
}

export interface RegisterRequest {
  name: string
  phone: string
  email: string
  role_id: number
  is_team_member?: boolean
}

export interface RegisterResponse {
  message: string
  user_id: number
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000/api" }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/users/new",
        method: "POST",
        body: userData,
      }),
    }),
    refresh: builder.query<{ accessToken: string }, void>({
      query: () => "/auth/refresh",
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation, useRefreshQuery } = authApi
