import React from 'react'

const DottedCrumb = ({ active }: { active?: boolean }) => {
  return (
    <div
      className={`h-px w-8 border-t-4 border-dotted ${
        active ? 'border-green-400' : 'border-gray-300'
      }`}
    />
  )
}

export default DottedCrumb
