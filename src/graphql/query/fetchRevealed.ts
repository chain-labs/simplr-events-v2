import { gql } from '@apollo/client'

const FETCH_REVEALED = gql`
  query FetchRevealed($address: Bytes) {
    simplrEvents(where: { address: $address }) {
      isRevealed
      ticketURI
    }
  }
`

export default FETCH_REVEALED
