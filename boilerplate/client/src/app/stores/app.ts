import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface AppState {
  currentUser: AuthedUser | null
  currentUserNeedsPasswordReset: boolean
}

export interface AuthedUser {
  id: string
  email: string
}

const initialState: AppState = {
  currentUser: null,
  currentUserNeedsPasswordReset: false,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAuthedUser(state, data: PayloadAction<AuthedUser>) {
      state.currentUser = data.payload
    },
  },
})

export const { setAuthedUser } = appSlice.actions
export default appSlice.reducer
