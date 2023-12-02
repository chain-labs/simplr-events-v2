interface IfProps {
  condition: boolean
  then: any
  else?: any
}
const If = (props: IfProps): any => {
  const condition = props.condition || false
  const positive = props.then || null
  const negative = props.else || null

  return condition ? positive : negative
}

export default If
