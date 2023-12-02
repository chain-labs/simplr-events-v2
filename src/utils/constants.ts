export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
const toBoolean = (condition: string) => {
  if (condition?.toLowerCase() === 'true') {
    return true
  } else if (condition?.toLowerCase() === 'false') {
    return false
  } else {
    return false
  }
}

export const LOGO_URL =
  'https://ik.imagekit.io/chainlabs/Simplr_Collection_Dapp/simplr-logo__v0Tmlq6M.png?ik-sdk-version=javascript-1.4.3&updatedAt=1675703009631'
export const BACKGROUND_MEDIA =
  'https://ik.imagekit.io/chainlabs/Simplr_Events/pexels-adrien-olichon-2387793_7h4CeXjRss.jpg?ik-sdk-version=javascript-1.4.3&updatedAt=1675402350598'
export const SUBGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_SUBGRAPH_ENDPOINT

export const ARCANA_APP_ADDRESS = process.env.NEXT_PUBLIC_ARCANA_APP_ADDRESS

export const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN

export const GELATO_API_KEY = process.env.NEXT_PUBLIC_GELATO_API_KEY

export const TEST_NETWORK = toBoolean(process.env.NEXT_PUBLIC_TEST_NETWORK)

export const getNetwork = (): {
  chainId: string
  blockExplorer: string
  unit: string
  name: string
} => {
  if (TEST_NETWORK) {
    return {
      name: 'mumbai',
      chainId: '80001',
      blockExplorer: 'https://mumbai.polygonscan.com/',
      unit: 'MATIC',
    }
  } else {
    return {
      name: 'matic',
      chainId: '137',
      blockExplorer: 'https://polygonscan.com/',
      unit: 'MATIC',
    }
  }
}

export const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME

export const SIMPLR_ADDRESS = '0x63ae231DE70393E6Eea8CeE9622D84960ebBcd13'

export const RELAY_TASK_CHECK_ENDPOINT =
  'https://relay.gelato.digital/tasks/status/'

export const SERVER_ENDPOINT = process.env.NEXT_PUBLIC_SERVER_ENDPOINT

export const COLLECTION_TYPE = process.env.NEXT_PUBLIC_COLLECTION_TYPE

export const STATIC_PASSWORD = process.env.NEXT_PUBLIC_STATIC_PASSWORD

export const OPENSEA_URL = TEST_NETWORK
  ? `https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/`
  : `https://opensea.io/assets/matic/${CONTRACT_ADDRESS}/`

export const ENABLE_QR = toBoolean(process.env.NEXT_PUBLIC_ENABLE_QR)

export const TWITTER_URL = process.env.NEXT_PUBLIC_TWITTER_URL

export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL

export const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL

export const EVENT_LOGO = process.env.NEXT_PUBLIC_EVENT_LOGO

export const EVENT_URL = process.env.NEXT_PUBLIC_EVENT_URL

export const EVENT_NAME = process.env.NEXT_PUBLIC_EVENT_NAME

export const PARTICLE_PROJECT_ID: string =
  process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID ?? ''
export const PARTICLE_CLIENT_KEY: string =
  process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY ?? ''
export const PARTICLE_APP_ID = process.env.NEXT_PUBLIC_PARTICLE_APP_ID ?? ''
export const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL ?? ''

export const NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS ?? ''
