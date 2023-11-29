import { gql } from '@apollo/client'

const FETCH_EVENT_NAME = gql`
  query FetchEventName($address: String) {
    simplrEvents(where: { address: $address }) {
      name
    }
  }
`

export default FETCH_EVENT_NAME
