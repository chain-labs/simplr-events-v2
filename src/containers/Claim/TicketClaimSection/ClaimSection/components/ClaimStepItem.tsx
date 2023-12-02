import If from '@/components/If'
import Spinner from '@/containers/Claim/components/Spinner'
import { CircleCheckFill, CircleXFill } from 'akar-icons'
import { useEffect, useState } from 'react'

interface ClaimStepItemProps {
  step: number
  currentStep: number
  label: string
  failed?: boolean
  waitForUser?: boolean
  children?: React.ReactNode
}

const ClaimStepItem = ({
  step,
  currentStep,
  label,
  children,
  failed,
  waitForUser,
}: ClaimStepItemProps) => {
  const [waitingforUser, setWaitingForUser] = useState(waitForUser)

  useEffect(() => {
    setWaitingForUser(waitForUser)
  }, [waitForUser])

  return (
    <li className={`mb-10 ml-6 ${currentStep >= step ? 'block' : 'hidden'}`}>
      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
        <If
          condition={currentStep <= step}
          then={
            <If
              condition={currentStep !== step || waitingforUser}
              then={<div className="h-4 w-4 rounded-full bg-blue-600"></div>}
              else={<Spinner />}
            />
          }
          else={
            <If
              condition={failed}
              then={
                <div className="bg-white text-red-600">
                  <CircleXFill strokeWidth={2} size={25} color="currentColor" />
                </div>
              }
              else={
                <div className="bg-white text-green-600">
                  <CircleCheckFill
                    strokeWidth={2}
                    size={25}
                    color="currentColor"
                  />
                </div>
              }
            />
          }
        />
      </span>
      <h3 className="mb-2 flex items-center text-lg font-semibold text-gray-900 ">
        {label}
      </h3>
      {children}
    </li>
  )
}

export default ClaimStepItem
