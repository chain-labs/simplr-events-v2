import { createReducer } from '@reduxjs/toolkit'

import { setUser, removeUser } from './actions'

export type UserState = {
  address: string
  exists: boolean
}

const initialState: UserState = {
  address: '',
  exists: false,
}

export const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setUser, (state, action) => {
      state.address = action.payload
      if (action.payload.length >= 1) {
        state.exists = true
      }
    })
    .addCase(removeUser, (state) => {
      state.address = ''
      state.exists = false
    })
})
