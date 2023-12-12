import Head from 'next/head'
import {
  PARTICLE_PROJECT_ID,
  PARTICLE_CLIENT_KEY,
  PARTICLE_APP_ID,
  PAYMASTER_URL,
  CONTRACT_ADDRESS,
  NFT_ADDRESS,
  SIMPLR_ADDRESS,
  ALCHEMY_API_KEY,
} from '@/utils/constants'
import LitJsSdk from '@lit-protocol/sdk-browser'
import SignatureStep from '../TicketClaimSection/ClaimSection/SignatureStep'
import { encodeFunctionData } from 'viem'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Minter from './Minter'
import {
  encryptRawData,
  getAccessControlConditions,
  getSignature,
  pinFile,
  pinJson,
} from '../utils'
import { ethers, providers } from 'ethers'

import { FETCH_EVENT_OWNER_QUERY } from '@/graphql/query/fetchEventOwnerAddress'
import { client } from '@/components/ApolloClient'
import { CLAIM_STEPS } from './ClaimSection/constants'
import { AlchemyProvider } from '@alchemy/aa-alchemy'
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from '@alchemy/aa-accounts'
import { polygonMumbai } from 'viem/chains'
import { createWeb3AuthSigner } from './auth'

const TicketClaimSection = ({ query }) => {
  const [signature, setSignature] = useState()
  const [secretHash, setSecretHash] = useState(null)

  const [name, setName] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const [currentStep, setCurrentStep] = useState(CLAIM_STEPS.GET_SIGNATURE)
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<providers.JsonRpcSigner>()
  const [address, setAddress] = useState<string>('')

  const connect = async () => {
    // try {
    const chain = polygonMumbai
    const owner = await createWeb3AuthSigner()
    const provider = new AlchemyProvider({
      apiKey: ALCHEMY_API_KEY,
      chain: chain,
    })
    const connectedProvider = provider.connect(
      (rpcClient) =>
        new LightSmartContractAccount({
          chain: chain,
          owner: owner,
          factoryAddress: getDefaultLightAccountFactoryAddress(chain),
          rpcClient,
        }),
    )
    // const address = await connectedProvider.getAddress()
    // console.log(address)
    const web3provider = new ethers.providers.Web3Provider(provider)
    console.log(web3provider)
    setProvider(web3provider)
    const signer = await web3provider.getSigner()
    console.log('SIGNER:', signer)
    setSigner(signer)
    const address = await connectedProvider.getAddress()
    console.log(address)
    setAddress(address)

    // const address = await owner.getAuthDetails()
    // console.log(address)

    // } catch (error) {
    //   console.log(error)
    // }
  }

  const handleEncryptandPin = async () => {
    console.log(provider, address)
    // Initialize Lit Protocol SDK
    const litClient = new LitJsSdk.LitNodeClient()
    await litClient.connect()

    // Fetch event owner address from Subgrqph to be used for access control condition
    const eventData = await client.query({
      query: FETCH_EVENT_OWNER_QUERY,
      variables: {
        address: NFT_ADDRESS,
      },
    })
    console.log(eventData)
    const eventOwnerAddress = eventData.data.simplrEvents[0].owner.address

    // Define access control conditions
    const accessControlConditions = getAccessControlConditions([
      address,
      eventOwnerAddress,
      SIMPLR_ADDRESS,
    ])

    // Creating raw data as object for encryption
    const rawData = {
      emailid: query.emailid,
      firstname: query.firstname,
      lastnama: query.lastname,
      batchid: query.batchid,
    }

    // Encrypt raw user data using Lit Protocol
    const { encryptedString, symmetricKey } = await encryptRawData(rawData)

    const signature = await getSignature(provider, address)
    console.log(signature)

    // Create encrypted key for decryption later
    const encryptedSymmetricKey = await litClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig: signature,
      chain: 'mumbai',
    })

    // Pinning encrypted string file to NFT Storage
    const encryptedStringRes = await pinFile(encryptedString, query.eventname)

    const encryptedStringHash = encryptedStringRes.data.IpfsHash

    // Define Secret object used for decryption of data
    const secret = {
      description: `A secret was sealed when claiming ticket from ${
        query.eventname
      } on ${Date.now()}`,
      name: query.eventname,
      external_url: '',
      image: new Blob(),
      image_description: 'Photo by Folco Masi on Unsplash',
      secret: {
        accessControlConditions: accessControlConditions,
        encryptedSymmetricKey: LitJsSdk.uint8arrayToString(
          encryptedSymmetricKey,
          'base16',
        ),
        encryptedStringHash: encryptedStringHash,
      },
      attributes: [
        {
          display_type: 'date',
          trait_type: 'sealed on',
          value: Math.floor(Date.now() / 1000),
        },
      ],
    }

    // Pinning the secret to NFT Storage
    const secretHash = await pinJson(secret)
    setSecretHash(secretHash)
    return secretHash

    // Move to next step
    // setCurrentStep(CLAIM_STEPS.MINT_TICKET)
  }

  return (
    <>
      <Head>
        <title>Claim your ticket</title>
        <meta
          name="description"
          content="Degen Diwali: Wishing you a Happy Dipawali! Claim to participate in Lucky Draw."
        />
      </Head>
      <main className="flex h-screen flex-col items-center justify-start bg-center">
        <div className="flex flex-col items-center">
          <h1 className="mt-2 text-4xl text-black">Simplr Events V2</h1>
          <Minter
            address={address}
            // smartAccount={smartAccount}
            provider={provider}
            connect={connect}
            query={query}
            handleEncryptandPin={handleEncryptandPin}
            signer={signer}
          />
        </div>
      </main>
    </>
  )
}
export default TicketClaimSection
