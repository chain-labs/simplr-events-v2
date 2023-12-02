import React from 'react'
import { STEP_NAME } from '../constants'

const RoundedStep = ({
  stepNumber,
  current,
}: {
  stepNumber: number
  current: number
}) => {
  return (
    <div className="relative flex w-10 flex-col text-center text-black">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full  border-2 ${
          current > stepNumber
            ? 'border-green-400'
            : current === stepNumber
            ? 'border-blue-600'
            : 'border-gray-300'
        }`}
      >
        <h3
          className={`text-2xl ${
            current > stepNumber
              ? 'text-green-400'
              : current === stepNumber
              ? 'text-blue-600'
              : 'text-gray-300'
          }`}
        >
          {stepNumber}
        </h3>
      </div>
      <h2
        className={`absolute top-full left-1/2 w-16 -translate-x-1/2 text-xs font-medium`}
      >
        {STEP_NAME[stepNumber]}
      </h2>
    </div>
  )
}

export default RoundedStep
