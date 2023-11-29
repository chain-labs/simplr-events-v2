import { ApolloClient, InMemoryCache } from '@apollo/client'
import { SUBGRAPH_ENDPOINT } from '@/utils/constants'

export const client = new ApolloClient({
  uri: SUBGRAPH_ENDPOINT,
  cache: new InMemoryCache(),
})

export default ApolloClient
