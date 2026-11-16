import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/features/chat/types'
import { loadBootstrap, updateUserStatus } from '@/features/chat/slice/chatThunks'

interface UsersState {
  byId: Record<string, User>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: UsersState = {
  byId: {},
  status: 'idle',
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    hydrateUsers(_state, action: PayloadAction<UsersState>) {
      return { ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadBootstrap.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.byId = Object.fromEntries(action.payload.users.map((u) => [u.id, u]))
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.byId[action.payload.id] = action.payload
      })
  },
})

export const { hydrateUsers } = usersSlice.actions
export default usersSlice.reducer
