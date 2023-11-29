import { gql } from '@apollo/client'

const FETCH_HOLDER_TICKETS = gql`
  query FetchHolderTickets($id: String, $first: Int) {
    holders(where: { id_contains_nocase: $id }) {
      address {
        address
      }
      tickets(orderBy: tokenId, orderDirection: desc, first: $first) {
        tokenId
        metadataCid
        creationTimeStamp
        creationTrx
        dataCid
        simplrEvent {
          name
        }
      }
    }
  }
`

export default FETCH_HOLDER_TICKETS

export interface ITicket {
  tokenId: string
  metadataCid: string
  creationTimeStamp: string
  creationTrx: string
  dataCid: string
  simplrEvent: {
    name: string
  }
}
