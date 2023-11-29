import { createReducer } from '@reduxjs/toolkit'
import { WalletState } from './types'
import { logoutUser, setProvider, setSDK, setWalletUser } from './actions'

const initialWalletState: WalletState = {
  provider: null,
  SDK: null,
  user: {
    address: '',
    email: '',
    name: '',
    profileImage: '',
  },
}

export const walletReducer = createReducer(initialWalletState, (builder) => {
  builder
    .addCase(setProvider, (state, action) => {
      state.provider = action.payload
    })
    .addCase(setWalletUser, (state, action) => {
      state.user = action.payload
    })
    .addCase(setSDK, (state, action) => {
      state.SDK = action.payload
    })
    .addCase(logoutUser, (state) => {
      state.user = initialWalletState.user
      state.provider = initialWalletState.provider
    })
})
