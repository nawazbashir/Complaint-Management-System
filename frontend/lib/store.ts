import { configureStore } from "@reduxjs/toolkit"
import { issueApi } from "./features/issue-api"
import { complaintApi } from "./features/complaint-api"
import { departmentApi } from "./features/department-api"
import { authApi } from "./features/auth-api"
import { roleApi } from "./features/role-api"
import { userApi } from "./features/user-api"
import authReducer from "./features/auth-slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [issueApi.reducerPath]: issueApi.reducer,
    [complaintApi.reducerPath]: complaintApi.reducer,
    [departmentApi.reducerPath]: departmentApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [roleApi.reducerPath]: roleApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(issueApi.middleware)
      .concat(complaintApi.middleware)
      .concat(departmentApi.middleware)
      .concat(authApi.middleware)
      .concat(roleApi.middleware)
      .concat(userApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
