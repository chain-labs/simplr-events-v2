import React, { useEffect } from 'react'
import {
  EVENT_LOGO,
  EVENT_URL,
  getNetwork,
  LOGO_URL,
  TEST_NETWORK,
  TOKEN_NAME,
} from '@/utils/constants'
import Image from 'next/image'
import TicketClaimSection from './TicketClaimSection'
import { QueryProps } from './types'
import If from '@/components/If'
import TicketsSection from './TicketsSection'
import useBiconomyWallet from '@/components/useBiconomyWallet'
// import { ethers } from 'ethers'
import { useAppSelector } from '@/redux/hooks'
import { walletSelector } from '@/redux/wallet'
import { Wallet } from 'akar-icons'
import { toast, ToastContainer } from 'react-toastify'

const checkQuery = (query: QueryProps): boolean => {
  const { lastname, firstname, emailid, eventname, batchid } = query
  if (lastname && firstname && emailid && eventname && batchid) return true
  else {
    toast.error('Invalid URL')
    return false
  }
}

const ClaimComponent = ({ query }: { query: QueryProps }) => {
  // useBiconomyWallet({
  //   chainId: ethers.utils.hexValue(TEST_NETWORK ? 80001 : 137),
  //   network: TEST_NETWORK ? 'testnet' : 'mainnet',
  //   whitelistUrls: {},
  // })

  const wallet = useAppSelector(walletSelector)

  useEffect(() => {
    // console.log('provider:', provider)
    console.log('Network:', getNetwork().chainId)
  }, [])

  return (
    <div
      className={`
      flex
      min-h-screen
      w-screen
      flex-col
      bg-slate-200
      `}
    >
      <If
        condition={!!wallet.provider}
        then={
          <div
            className="fixed bottom-4 right-4 rounded-full bg-blue-700 px-4 py-4"
            onClick={() => {
              wallet.SDK.sdk.showWallet()
            }}
          >
            <Wallet strokeWidth={2} size={36} />
          </div>
        }
      />
      <div className="flex flex-1 flex-col pb-6">
        <div className="container flex items-center justify-between bg-white py-1 px-1 shadow-md sm:px-8 sm:py-2">
          <a
            className="relative h-6 w-28 overflow-x-visible sm:h-8"
            href="https://simplrhq.com"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src={LOGO_URL}
              fill
              alt="logo image"
              style={{ objectFit: 'contain' }}
            />
          </a>
          <a href={EVENT_URL} target="_blank" rel="noreferrer">
            <div className="relative h-16 w-28 overflow-x-visible sm:h-16">
              <Image
                src={EVENT_LOGO}
                fill
                alt="event image"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </a>
        </div>
        <div className="container mt-4 flex flex-1 flex-col border-l-4 border-l-emerald-400 bg-white pb-12 shadow-md">
          <div className="container px-4 py-6">
            <If
              condition={checkQuery(query)}
              then={
                <h1 className="text-center text-3xl font-bold text-black">
                  Time to seize your digital bragging rights!
                </h1>
              }
            />
          </div>
          <If
            condition={checkQuery(query)}
            then={<TicketClaimSection query={query} />}
            else={
              <div>
                <div className="text-center text-5xl font-bold text-black">
                  URL is incorrect
                </div>
                <ToastContainer
                  containerId={'toaster'}
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                />
              </div>
            }
          />
        </div>
        d
      </div>
    </div>
  )
}

export default ClaimComponent
