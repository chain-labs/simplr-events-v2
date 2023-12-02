import React from 'react'
import ClaimStepItem from './components/ClaimStepItem'
import { CLAIM_STEPS } from './constants'

interface Props {
  currentStep: number
}

const SecurityStep = ({ currentStep }: Props) => {
  return (
    <ClaimStepItem
      step={CLAIM_STEPS.ENCRYPTING}
      currentStep={currentStep}
      label="Let us catch our breath- hold your horses for a sec! 🏃‍♀️💨 "
    ></ClaimStepItem>
  )
}

export default SecurityStep
