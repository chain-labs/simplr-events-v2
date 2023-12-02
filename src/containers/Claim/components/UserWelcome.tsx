import If from '@/components/If'
import { useAppSelector } from '@/redux/hooks'
import { walletSelector } from '@/redux/wallet'
import { OpenEnvelope } from 'akar-icons'
import React from 'react'

const UserWelcome = () => {
  const wallet = useAppSelector(walletSelector)
  return (
    <If
      condition={!!wallet.user.name}
      then={
        <div className="mt-10 rounded-lg bg-blue-100 px-4 py-6">
          <h2 className="text-2xl font-bold text-black">
            Welcome, <span className="text-blue-800">{wallet.user.name}</span>
          </h2>
          <div className="flex">
            <div>
              <img
                className="mr-2 w-10 rounded-full"
                src={wallet.user.profileImage}
                alt="profileImage"
              />
            </div>
            <div className="border-l border-l-gray-400 pl-2">
              <h2 className="font-regular flex items-center text-sm text-gray-600">
                <OpenEnvelope
                  strokeWidth={2}
                  size={14}
                  color="black"
                  style={{ marginRight: '6px' }}
                />
                {`${wallet.user.email} `}
              </h2>
              <div className="rounded-lg text-sm font-bold text-red-600">
                <span className="font-bold text-black">Not you? </span>
                <span
                  className="cursor-pointer"
                  onClick={wallet.SDK.disconnect}
                >
                  Logout
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    />
  )
}

export default UserWelcome
