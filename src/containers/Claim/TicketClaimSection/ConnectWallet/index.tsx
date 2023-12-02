import React, { useEffect, useState } from 'react'
import { ethers, providers } from 'ethers'
import { ArrowCycle, ChevronRight, GoogleFill } from 'akar-icons'
import If from '@/components/If'
import { STEPS } from '../../constants'
import Image from 'next/image'
import { TOKEN_NAME } from '@/utils/constants'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  logoutUser,
  setProvider,
  setWalletUser,
  walletSelector,
} from '@/redux/wallet'

const ConnectWallet = ({
  setStep,
  subscribe,
  setSubscribe,
}: {
  setStep: (number) => void
  subscribe: boolean
  setSubscribe: (boolean) => void
}) => {
  const wallet = useAppSelector(walletSelector)
  const dispatch = useAppDispatch()
  const [signer, setSigner] = useState<providers.JsonRpcSigner>()
  const [loggingIn, setLoggingIn] = useState(false)

  const handleConnect = async (e) => {
    e.preventDefault()
    setLoggingIn(true)
    if (typeof window === 'undefined') return

    const sdkProvider = wallet.SDK?.sdk?.provider
    if (sdkProvider) {
      const web3Provider = new ethers.providers.Web3Provider(sdkProvider)
      const accounts = await web3Provider.listAccounts()
      const userInfo = await wallet.SDK?.sdk?.getUserInfo()

      const userDispatchItem = {
        address: accounts[0],
        email: userInfo.email,
        name: userInfo.name,
        profileImage: userInfo.profileImage,
      }

      dispatch(setWalletUser(userDispatchItem))
      return
    }
    if (wallet.SDK.sdk) {
      console.log('opening wallet')

      wallet.SDK?.sdk?.showWallet()
      return wallet.SDK?.sdk
    }
    const signer = wallet?.provider?.getSigner()
    setSigner(signer)
    setProvider(wallet?.provider)
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    localStorage.removeItem('openlogin_store')
    localStorage.removeItem('Web3Auth-cachedAdapter')
    setProvider(null)
    setSigner(null)
  }

  useEffect(() => {
    if (wallet.user.address) {
      setLoggingIn(false)
    }
  }, [wallet.user.address])

  useEffect(() => {
    console.log({ subscribe })
  }, [subscribe])

  return (
    <div>
      <div className="my-6">
        <h2 className=" text-2xl font-semibold">
          Ready to snag your {TOKEN_NAME}?
        </h2>
        <h4 className="mt-2 text-sm font-normal">
          Use your Google Account to log in to Web3 and let the magic happen! ✨
        </h4>
      </div>
      <If
        condition={!wallet.user.address}
        then={
          <React.Fragment>
            <div className="mb-2 flex">
              <input
                // checked
                id="checked-checkbox"
                type="checkbox"
                value={`${subscribe}`}
                onChange={() => setSubscribe(!subscribe)}
                className="mt-1 h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-600"
                checked={subscribe}
              />
              <label
                htmlFor="checked-checkbox"
                className="ml-2 text-sm font-medium text-black"
              >
                By selecting this checkbox you agree to allow Simplr to send you
                education and newsletters about the Web3 via mail
              </label>
            </div>
            <If
              condition={!loggingIn}
              then={
                <button
                  className="mt-4 flex items-center gap-x-4 rounded-full bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                  onClick={handleConnect}
                >
                  <GoogleFill />
                  Login with Google
                </button>
              }
              else={
                <button
                  className="flex items-center gap-x-4 rounded-full bg-blue-300 py-2 px-4 font-bold text-white"
                  disabled
                >
                  <div className="animate-spin-slow">
                    <ArrowCycle strokeWidth={2} size={18} />
                  </div>
                  Signing In
                </button>
              }
            />
          </React.Fragment>
        }
        else={
          <div>
            <div className="mt-4">
              <div className="text-lg font-bold">
                <span className="flex items-center rounded-full border bg-gray-200 px-4 py-2 text-sm font-semibold">
                  <div className="relative mr-2 h-8 w-8 overflow-hidden rounded-full">
                    <Image src={wallet?.user?.profileImage} fill alt="pfp" />
                  </div>
                  {wallet?.user?.email}
                </span>
              </div>
              <p className="float-right mr-2 text-sm font-medium">
                Not You?{' '}
                <button
                  className="text-red-400 underline"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </p>
            </div>
            {/* <div className="text-sm">Wallet Address: {auth?.user?.picture}</div> */}
            <button
              className="mt-10 flex items-center gap-x-1 rounded-full bg-green-500 py-2 px-4 font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
              onClick={() => setStep(STEPS.ENCRYPT_DATA)}
            >
              Proceed
              <div className="animate-bounce-right">
                <ChevronRight size={18} />
              </div>
            </button>
          </div>
        }
      />
    </div>
  )
}

export default ConnectWallet
