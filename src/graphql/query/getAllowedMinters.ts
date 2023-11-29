import { gql } from '@apollo/client'

export const GET_ALLOWED_MINTERS_QUERY = gql`
  query GetAllowedMinters {
    minters {
      address {
        address
      }
    }
  }
`
