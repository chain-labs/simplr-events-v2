import { gql } from '@apollo/client'

export const GET_TICKET_OWNER_ID_QUERY = gql`
  query GetTickerOwnerId($id: Bytes) {
    ticket(id: $id) {
      holder {
        address {
          id
        }
      }
    }
  }
`
