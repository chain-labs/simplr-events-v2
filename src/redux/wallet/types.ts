import SocialLogin from '@biconomy/web3-auth'
import { ethers } from 'ethers'

export type iSDK = {
  connect: (any) => any
  disconnect: (any) => any
  sdk: SocialLogin
}

export type IUser = {
  address: string
  name: string
  profileImage: string
  email: string
}

export type WalletState = {
  SDK: iSDK
  provider: ethers.providers.Web3Provider
  user: IUser
}
