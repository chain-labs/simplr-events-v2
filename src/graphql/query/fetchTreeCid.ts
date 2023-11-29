import { gql } from '@apollo/client'

export const FETCH_TREE_CID_QUERY = gql`
  query FetchTreeCid($id: BigInt!) {
    batches(where: { batchId: $id }) {
      batchId
      cid
    }
  }
`
