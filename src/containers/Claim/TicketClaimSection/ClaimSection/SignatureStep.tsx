import If from '@/components/If'
import { ChevronRight } from 'akar-icons'
import React, { useState } from 'react'
import { getSignature } from '../../utils'
import ClaimStepItem from './components/ClaimStepItem'
import { CLAIM_STEPS } from './constants'
import { useAppSelector } from '@/redux/hooks'
import { walletSelector } from '@/redux/wallet'

interface Props {
  currentStep: number
  signature: any
  setCurrentStep: (number) => void
  setSignature: (any) => void
}

const SignatureStep = ({
  currentStep,
  setCurrentStep,
  signature,
  setSignature,
}: Props) => {
  const wallet = useAppSelector(walletSelector)
  const [waitingForUser, setWaitingForUser] = useState(true)

  const handleSignature = async (e) => {
    e.preventDefault()
    setWaitingForUser(false)
    setCurrentStep(CLAIM_STEPS.GET_SIGNATURE)
    const signature = await getSignature(wallet)
    setSignature(signature)
    setCurrentStep(CLAIM_STEPS.ENCRYPTING)
  }

  return (
    <ClaimStepItem
      step={CLAIM_STEPS.GET_SIGNATURE}
      currentStep={currentStep}
      label={
        waitingForUser
          ? 'Allow us to protect your data!'
          : 'Approve the message to proceed'
      }
      waitForUser={waitingForUser}
    >
      <If
        condition={!signature}
        then={
          <React.Fragment>
            <button
              className="mt-4 flex items-center gap-x-1 rounded-full bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              onClick={handleSignature}
              disabled={!waitingForUser}
            >
              Allow
              <div className="animate-bounce-right">
                <ChevronRight size={18} />
              </div>
            </button>
            <If
              condition={!waitingForUser}
              then={
                <h3 className="mt-2 text-sm font-medium">{`"Approve" the pop up to proceed.`}</h3>
              }
            />
          </React.Fragment>
        }
      />
    </ClaimStepItem>
  )
}

export default SignatureStep
