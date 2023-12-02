import If from '@/components/If'
import { ArrowCycle, GoogleFill } from 'akar-icons'
import React, { useEffect, useState } from 'react'
import Spinner from '../components/Spinner'
import LoggedIn from './LoggedIn'
import { useAppSelector } from '@/redux/hooks'
import { walletSelector } from '@/redux/wallet'

const TicketsSection = () => {
  const [loggingIn, setLoggingIn] = useState(false)
  const [initial, setInitial] = useState(true)
  const [ready, setReady] = useState(false)

  const wallet = useAppSelector(walletSelector)

  const handleConnect = async (e) => {
    e.preventDefault()
    setInitial(false)
    setLoggingIn(true)
    // await auth.loginWithSocial('google')
    if (wallet.SDK.sdk) {
      wallet.SDK?.connect(wallet.SDK.sdk)
    }
  }

  useEffect(() => {
    const isReady = !!wallet.SDK?.sdk
    console.log({ wallet, isReady })
    setReady(isReady)
  }, [wallet.SDK?.sdk])

  useEffect(() => {
    if (loggingIn && wallet.user.name) {
      setLoggingIn(false)
    }
  }, [wallet.user.name])

  if (!ready) {
    return (
      <div className="mt-48 flex h-full w-full items-center justify-center ">
        <div className="h-16 w-16">
          <Spinner />
        </div>
      </div>
    )
  }

  if (ready && wallet.user.address !== '') {
    return <LoggedIn />
  } else
    return (
      <div className="flex h-3/4 flex-1 flex-col items-center justify-center">
        <div className="mb-6 text-xl font-semibold text-black">
          Login to continue
        </div>
        <button
          className="flex items-center gap-x-4 rounded-full bg-blue-500 py-2 px-4 font-bold text-white disabled:bg-gray-500"
          onClick={handleConnect}
          disabled={loggingIn}
        >
          <If
            condition={!loggingIn}
            then={
              <React.Fragment>
                <GoogleFill />
                Login with Google
              </React.Fragment>
            }
            else={
              <React.Fragment>
                <div className="animate-spin-slow">
                  <ArrowCycle strokeWidth={2} size={18} />
                </div>
                Signing In
              </React.Fragment>
            }
          />
        </button>
      </div>
    )
}

export default TicketsSection
