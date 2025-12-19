import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "../store"

export interface User {
  user_id: number
  name: string
  phone: string
  email: string
  role_id: number
  role_name?: string
  is_team_member: boolean
}

export interface CreateUserRequest {
  name: string
  phone: string
  email: string
  role_id: number
  is_team_member: boolean
}

export interface UpdateUserRequest {
  id: number
  name: string
  phone: string
  email: string
  role_id: number
  is_team_member: boolean
}

export const userApi = createApi({
  reducerPath: "userApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000/api" }),

  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: ["User"],
    }),
    getUser: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),
    createUser: builder.mutation<{ message: string; user_id: number }, CreateUserRequest>({
      query: (body) => ({
        url: "/users/new",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<{ message: string }, UpdateUserRequest>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi
