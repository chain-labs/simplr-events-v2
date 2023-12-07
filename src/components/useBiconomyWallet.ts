import { useCallback, useEffect, useState } from 'react'
import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from '@biconomy/account'
import { Wallet, providers, ethers } from 'ethers'
import { ChainId } from '@biconomy/core-types'
import { ParticleAuthModule, ParticleProvider } from '@biconomy/particle-auth'

import '@biconomy/web3-auth/dist/src/style.css'
import { useAppDispatch } from '@/redux/hooks'
import {
  setSDK,
  setProvider as setWalletProvider,
  setWalletUser,
  logoutUser,
} from '@/redux/wallet'

interface Configs {
  chainId: string
  network: 'testnet' | 'mainnet'
  whitelistUrls?: any
}

const useBiconomyWallet = (options: Configs) => {
  const [provider, setProvider] = useState<any>()
  const [account, setAccount] = useState<string>()
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null)
  const [scwAddress, setScwAddress] = useState('')
  const [scwLoading, setScwLoading] = useState(false)
  const [socialLoginSDK, setSocialLoginSDK] = useState<SocialLogin | null>(null)

  const dispatch = useAppDispatch()

  const connectWeb3 = useCallback(
    async (SDK = socialLoginSDK) => {
      if (typeof window === 'undefined') return
      if (SDK?.provider) {
        const web3Provider = new ethers.providers.Web3Provider(SDK.provider)
        setProvider(web3Provider)
        dispatch(setWalletProvider(web3Provider))
        const accounts = await web3Provider.listAccounts()
        setAccount(accounts[0])
        const userInfo = await SDK.getUserInfo()

        dispatch(
          setWalletUser({
            address: accounts[0],
            email: userInfo.email,
            name: userInfo.name,
            profileImage: userInfo.profileImage,
          }),
        )
        return
      }
      if (SDK) {
        console.log('Biconomy/Opening-Wallet')

        SDK?.showWallet()
        return SDK
      }

      setSocialLoginSDK(SDK)
      SDK?.showWallet()
      return SDK
    },
    [socialLoginSDK],
  )

  // if wallet already connected close widget
  useEffect(() => {
    console.log('biconomy/hide-wallet')
    if (socialLoginSDK && socialLoginSDK.provider) {
      socialLoginSDK.hideWallet()
    }
  }, [account, socialLoginSDK])

  // after metamask login -> get provider event
  useEffect(() => {
    const interval = setInterval(async () => {
      if (account) {
        clearInterval(interval)
      }
      if (socialLoginSDK?.provider && !account) {
        connectWeb3()
      }
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [account, connectWeb3, socialLoginSDK])

  const disconnectWeb3 = async () => {
    dispatch(logoutUser())
    if (!socialLoginSDK || !socialLoginSDK.web3auth) {
      console.error('Web3Modal not initialized.')
      return
    }

    await socialLoginSDK.logout()
    socialLoginSDK.hideWallet()
    setProvider(undefined)
    setAccount(undefined)
    localStorage.removeItem('openlogin_store')
    localStorage.removeItem('Web3Auth-cachedAdapter')
    setScwAddress('')
  }

  useEffect(() => {
    const initSDK = async () => {
      if (!socialLoginSDK && connectWeb3 && disconnectWeb3) {
        const sdk = new SocialLogin()
        setSocialLoginSDK(sdk)
        const sign = await sdk.whitelistUrl(`${window.location.origin}`)
        options.whitelistUrls[window.location.origin] = sign
        sdk
          .init({
            ...options,
          })
          .then(() => {
            dispatch(
              setSDK({
                sdk: sdk,
                connect: connectWeb3,
                disconnect: disconnectWeb3,
              }),
            )
          })
      }
    }
    initSDK()
  }, [socialLoginSDK])

  useEffect(() => {
    async function setupSmartAccount() {
      setScwAddress('')
      setScwLoading(true)
      const smartAccount = new SmartAccount(provider, {
        activeNetworkId: ChainId.GOERLI,
        supportedNetworksIds: [ChainId.GOERLI],
      })
      await smartAccount.init()
      const context = smartAccount.getSmartAccountContext()
      setScwAddress(context.baseWallet.getAddress())
      setSmartAccount(smartAccount)
      setScwLoading(false)
    }
    if (!!provider && !!account) {
      setupSmartAccount()
      console.log('Provider...', provider)
    }
  }, [account, provider])

  return { connectWeb3, disconnectWeb3, account, provider }
}

export default useBiconomyWallet
