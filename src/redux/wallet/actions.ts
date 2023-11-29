import { createAction } from '@reduxjs/toolkit'
import { ethers } from 'ethers'
import { IUser, iSDK } from './types'

export const setSDK = createAction<iSDK>('wallet/SET_SDK')

export const setProvider = createAction<ethers.providers.Web3Provider>(
  'wallet/SET_PROVIDER',
)

export const setWalletUser = createAction<IUser>('wallet/SET_USER')

export const logoutUser = createAction('wallet/LOGOUT_USER')
