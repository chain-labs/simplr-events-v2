import { gql } from '@apollo/client'

export const GET_CURRENT_BATCH_ID_QUERY = gql`
  query GetCurrentBatchId {
    batches(orderBy: batchId, orderDirection: desc, first: 1) {
      batchId
    }
  }
`
