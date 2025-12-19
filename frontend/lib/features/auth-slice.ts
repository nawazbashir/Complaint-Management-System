import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface User {
  id: number
  name: string
  role: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
      // Store in localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", action.payload.accessToken)
        localStorage.setItem("user", JSON.stringify(action.payload.user))
        document.cookie = `accessToken=${action.payload.accessToken}; path=/; max-age=${7*24*60*60*1000}; SameSite=Lax`
      }
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
        cookieStore.delete("accessToken")

      }
    },
    loadFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken")
        const user = localStorage.getItem("user")
        if (token && user) {
          state.accessToken = token
          state.user = JSON.parse(user)
          state.isAuthenticated = true
          document.cookie = `accessToken=${token}; path=/; max-age=${7*24*60*60*1000}; SameSite=Lax`
        }
      }
    },
  },
})

export const { setCredentials, logout, loadFromStorage } = authSlice.actions
export default authSlice.reducer
