import Head from 'next/head'
import { ParticleAuthModule, ParticleProvider } from '@biconomy/particle-auth'
import {
  PARTICLE_PROJECT_ID,
  PARTICLE_CLIENT_KEY,
  PARTICLE_APP_ID,
  PAYMASTER_URL,
  CONTRACT_ADDRESS,
  NFT_ADDRESS,
  SIMPLR_ADDRESS,
} from '@/utils/constants'
import LitJsSdk from '@lit-protocol/sdk-browser'
import SignatureStep from '../TicketClaimSection/ClaimSection/SignatureStep'

import { useEffect, useState } from 'react'
import { IBundler, Bundler } from '@biconomy/bundler'
import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from '@biconomy/account'
import { ethers, providers } from 'ethers'
import { ChainId } from '@biconomy/core-types'
import { IPaymaster, BiconomyPaymaster } from '@biconomy/paymaster'
import {
  ECDSAOwnershipValidationModule,
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
} from '@biconomy/modules'
import Image from 'next/image'
import Minter from './Minter'
import {
  encryptRawData,
  getAccessControlConditions,
  getSignature,
  pinFile,
  pinJson,
} from '../utils'
import { FETCH_EVENT_OWNER_QUERY } from '@/graphql/query/fetchEventOwnerAddress'
import { client } from '@/components/ApolloClient'
import { CLAIM_STEPS } from './ClaimSection/constants'

const TicketClaimSection = ({ query }) => {
  const [signature, setSignature] = useState()
  const [secretHash, setSecretHash] = useState(null)

  const [address, setAddress] = useState<string>('')
  const [name, setName] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null)
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null)
  const [currentStep, setCurrentStep] = useState(CLAIM_STEPS.GET_SIGNATURE)
  const [signer, setSigner] = useState<providers.JsonRpcSigner>()

  const particle = new ParticleAuthModule.ParticleNetwork({
    projectId: PARTICLE_PROJECT_ID,
    clientKey: PARTICLE_CLIENT_KEY,
    appId: PARTICLE_APP_ID,
    chainId: ChainId.POLYGON_MAINNET,
    wallet: {
      displayWalletEntry: true,
      defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
    },
  })

  const connect = async () => {
    try {
      setLoading(true)
      const userInfo = await particle.auth.login()

      console.log('Logged in user:', userInfo)
      setName(userInfo?.name)
      const particleProvider = new ParticleProvider(particle.auth)
      console.log({ particleProvider })
      const web3Provider = new ethers.providers.Web3Provider(
        particleProvider,
        'matic',
      )
      setProvider(web3Provider)

      const module_var = await ECDSAOwnershipValidationModule.create({
        signer: web3Provider.getSigner(),
        moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
      })
      console.log(module_var.signer)
      setSigner(module_var.signer)

      const biconomySmartAccount = await BiconomySmartAccountV2.create({
        chainId: ChainId.POLYGON_MUMBAI,

        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        defaultValidationModule: module_var,
        activeValidationModule: module_var,
      })
      const accounts = await web3Provider.listAccounts()
      setAddress(accounts[0])
      console.log({ biconomySmartAccount })

      setSmartAccount(biconomySmartAccount)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  const bundler: IBundler = new Bundler({
    bundlerUrl: 'https://bundler.particle.network?chainId=80001',
    chainId: ChainId.POLYGON_MUMBAI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  })

  const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl: PAYMASTER_URL,
  })

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
        <title>Degen Diwali: Claim Now!</title>
        <meta
          name="description"
          content="Degen Diwali: Wishing you a Happy Dipawali! Claim to participate in Lucky Draw."
        />
      </Head>
      <main
        style={{
          backgroundImage: `url('https://ik.imagekit.io/chainlabs/Degen%20Diwali/DALL_E%20Diwali%20Background_JKc4Mvk8Q.png?updatedAt=1699990295809')`,
        }}
        className="flex h-screen w-screen flex-col items-center justify-center bg-center"
      >
        <nav className="fixed top-0 left-0 w-screen bg-amber-400 px-[10%]">
          <div className="relative h-20 w-40  ">
            <Image
              src="/assets/images/cl_logo.svg"
              alt="cl_logo"
              fill
              className="rounded-lg object-contain"
            />
          </div>
        </nav>
        <div className="flex flex-col items-center">
          <div className="relative h-40 w-40 ">
            <Image
              src=""
              alt="artwork_img"
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <h1 className="mt-2 text-4xl text-black">Degen Diwali</h1>

          <Minter
            address={address}
            smartAccount={smartAccount}
            provider={provider}
            connect={connect}
            query={query}
            handleEncryptandPin={handleEncryptandPin}
            signer={signer}
          />
          <p className="max-w-[200px] text-center">Hello from this side</p>
        </div>
      </main>
    </>
  )
}
export default TicketClaimSection
