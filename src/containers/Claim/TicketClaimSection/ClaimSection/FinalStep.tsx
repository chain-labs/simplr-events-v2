import If from '@/components/If'
import { TOKEN_NAME } from '@/utils/constants'
import { ChevronRight } from 'akar-icons'
import React from 'react'
import { STEPS } from '../../constants'
import ClaimStepItem from './components/ClaimStepItem'
import { CLAIM_STEPS } from './constants'

interface Props {
  currentStep: number
  setStep: (number) => void
  mintFailed: boolean
  setCurrentStep: (number) => void
  setMintFailed: (boolean) => void
  setSignature: (any) => void
}

const FinalStep = ({
  currentStep,
  mintFailed,
  setMintFailed,
  setStep,
  setCurrentStep,
  setSignature,
}: Props) => {
  return (
    <ClaimStepItem
      step={CLAIM_STEPS.CLAIM_TICKET}
      currentStep={currentStep}
      label={!mintFailed ? 'Finito! 🥳' : 'Failed Transaction! Try Again'}
      failed={mintFailed}
    >
      <If
        condition={currentStep === CLAIM_STEPS.CLAIM_TICKET}
        then={
          <div className="text-xs font-semibold">
            {"Sit tight, it's almost done."}
          </div>
        }
        else={
          <React.Fragment>
            <If
              condition={currentStep === CLAIM_STEPS.FINISHED && !mintFailed}
              then={
                <button
                  className="flex items-center gap-x-1 rounded-full bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                  onClick={() => setStep(STEPS.FINISH)}
                >
                  View your {TOKEN_NAME}
                  <div className="animate-bounce-right">
                    <ChevronRight size={18} />
                  </div>
                </button>
              }
            />
            <If
              condition={currentStep === CLAIM_STEPS.FINISHED && mintFailed}
              then={
                <button
                  className="flex items-center gap-x-1 rounded-full bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                  onClick={() => {
                    setCurrentStep(CLAIM_STEPS.GET_SIGNATURE)
                    setMintFailed(false)
                    setSignature(null)
                  }}
                >
                  Try Again
                  <div className="animate-bounce-right">
                    <ChevronRight size={18} />
                  </div>
                </button>
              }
            />
          </React.Fragment>
        }
      />
    </ClaimStepItem>
  )
}

export default FinalStep
