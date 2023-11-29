import { createSelector } from '@reduxjs/toolkit'
import { AppState } from '../store'

export const selectWallet = (state: AppState) => state.wallet

export const walletSelector = createSelector(selectWallet, (state) => state)

export const selectWalletSDK = (state: AppState) => state.wallet

export const walletSDKSelector = createSelector(
  selectWalletSDK,
  (state) => state.SDK,
)
