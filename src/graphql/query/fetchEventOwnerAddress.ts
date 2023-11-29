import { gql } from '@apollo/client'

export const FETCH_EVENT_OWNER_QUERY = gql`
  query FetchEventOwner($address: Bytes) {
    simplrEvents(where: { address: $address }) {
      owner {
        address
      }
    }
  }
`
