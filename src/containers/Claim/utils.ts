import { client } from '@/components/ApolloClient'
import { FormData } from 'nft.storage'
import { FETCH_TREE_CID_QUERY } from '@/graphql/query/fetchTreeCid'
import axios from 'axios'
import LitJsSdk from '@lit-protocol/sdk-browser'
import { BytesLike, ethers } from 'ethers'
import { QueryProps } from './types'
import {
  RELAY_TASK_CHECK_ENDPOINT,
  SERVER_ENDPOINT,
  TEST_NETWORK,
} from '@/utils/constants'
import { WalletState } from '@/redux/wallet/types'

export const FETCH_TREE_CID = async (id: string) => {
  const { data } = await client.query({
    query: FETCH_TREE_CID_QUERY,
    variables: {
      id,
    },
  })

  return data
}

export const getMerkleHashes = async (cid: string) => {
  const url = `https://simplr.mypinata.cloud/ipfs/${cid}`
  const { data } = await axios.get(url)
  const hashes = JSON.parse(Object.keys(data)[0])
  return hashes
}

export const hashQueryData = (query) => {
  const { emailid, lastname, firstname, eventname, batchid } = query
  const concatenatedString = `${emailid}-${lastname}-${firstname}-${batchid}-${eventname}`
  console.log({ concatenatedString })

  const hash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(concatenatedString),
  )
  return hash
}

export const verifyQueryDetails = async (query: QueryProps, cid: string) => {
  const merkleHashes: string[] = await getMerkleHashes(cid)
  const hash = hashQueryData(query)

  console.log({ merkleHashes, hash })

  const index = merkleHashes.findIndex((h) => h === hash)
  if (index != -1) {
    return true
  } else return false
}

export const getSignature = async (provider, address) => {
  console.log(provider, address)
  const authSig = await LitJsSdk.signAndSaveAuthMessage({
    web3: provider,
    account: address,
    chainId: TEST_NETWORK ? 80001 : 137,
  })
  return authSig
}

export const encryptRawData = async (data) => {
  const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
    JSON.stringify(data),
  )
  return { encryptedString, symmetricKey }
}

const chain = 'mumbai'

export const getAccessControlConditions = (addresses: string[]) => {
  const accessControlConditions = []
  addresses.forEach((address) => {
    const condition = {
      contractAddress: '',
      standardContractType: '',
      chain: chain,
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: address,
      },
    }
    accessControlConditions.push(condition)
    accessControlConditions.push({ operator: 'or' })
  })
  accessControlConditions.pop()
  return accessControlConditions
}

export const pinJson = async (JSONBody) => {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'
  return (
    await axios.post(url, JSONBody, {
      headers: {
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
      },
    })
  ).data.IpfsHash
}

export const pinFile = async (file, eventname) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`
  const data = new FormData()
  data.append('file', file, 'encryptedString.bin')
  const metadata = JSON.stringify({
    name: `${eventname}_encryptedString`,
  })
  data.append('pinataMetadata', metadata)
  return axios.post(url, data, {
    maxBodyLength: Infinity, //this is needed to prevent axios from erroring out with large files
    headers: {
      'Content-Type': 'multipart/form-data',
      pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
      pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
    },
  })
}

export const getRelayStatus = async (taskId: string) => {
  console.log(taskId)
  const endpoint = `${RELAY_TASK_CHECK_ENDPOINT}${taskId}`
  const res = await axios.get(endpoint)
  return res.data?.task
}

export interface ClaimTicketRequestBody {
  email: string
  firstName: string
  lastName: string
  eventName: string
  accountAddress: BytesLike
  tokenId: number
  batchId: number
  isSubscribed: boolean
  claimTimestamp: string
  claimTrx: BytesLike
  contractAddress: BytesLike
}

export const sendInfoToServer = async (body: ClaimTicketRequestBody) => {
  return await axios.post(`${SERVER_ENDPOINT}/claimTicket`, body)
}

export function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export function utf8ToHex(str: string) {
  return (
    '0x' +
    Array.from(str)
      .map((c) =>
        c.charCodeAt(0) < 128
          ? c.charCodeAt(0).toString(16)
          : encodeURIComponent(c).replace(/\\%/g, '').toLowerCase(),
      )
      .join('')
  )
}
