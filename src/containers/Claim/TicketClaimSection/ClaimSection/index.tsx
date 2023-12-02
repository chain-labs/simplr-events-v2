import React, { useEffect, useState } from 'react'
import LitJsSdk from '@lit-protocol/sdk-browser'
import { QueryProps } from '../../types'
import {
  ClaimTicketRequestBody,
  delay,
  encryptRawData,
  getAccessControlConditions,
  getRelayStatus,
  pinFile,
  pinJson,
  sendInfoToServer,
} from '../../utils'
import { CLAIM_STEPS } from './constants'
import { client } from '@/components/ApolloClient'
import { FETCH_EVENT_OWNER_QUERY } from '@/graphql/query/fetchEventOwnerAddress'
import { Blob } from 'nft.storage'
import { SIMPLR_ADDRESS } from '@/utils/constants'
import SignatureStep from './SignatureStep'
import SecurityStep from './SecurityStep'
import MintingStep from './MintingStep'
import FinalStep from './FinalStep'
import FETCH_HOLDER_TICKETS from '@/graphql/query/fetchHolderTickets'
import { toast } from 'react-hot-toast'
import { CONTRACT_ADDRESS } from '@/utils/constants'
import { useAppSelector } from '@/redux/hooks'
import { walletSelector } from '@/redux/wallet'

const ClaimSection = ({
  query,
  setStep,
  setQrData,
  subscribe,
}: {
  query: QueryProps
  setStep: (number) => void
  setQrData: (any) => void
  subscribe: boolean
}) => {
  const [signature, setSignature] = useState()
  const [currentStep, setCurrentStep] = useState(CLAIM_STEPS.GET_SIGNATURE)
  const [secretHash, setSecretHash] = useState(null)
  const [taskId, setTaskId] = useState('')
  const [mintFailed, setMintFailed] = useState(false)

  const wallet = useAppSelector(walletSelector)

  useEffect(() => {
    if (currentStep === CLAIM_STEPS.ENCRYPTING) {
      handleEncryptandPin()
    } else if (currentStep === CLAIM_STEPS.CLAIM_TICKET) {
      handleClaimTicket()
    }
  }, [currentStep])

  const handleEncryptandPin = async () => {
    // Initialize Lit Protocol SDK
    const litClient = new LitJsSdk.LitNodeClient()
    await litClient.connect()

    // Fetch event owner address from Subgrqph to be used for access control condition
    const eventData = await client.query({
      query: FETCH_EVENT_OWNER_QUERY,
      variables: {
        address: CONTRACT_ADDRESS,
      },
    })

    const eventOwnerAddress = eventData.data.simplrEvents[0].owner.address

    // Define access control conditions
    const accessControlConditions = getAccessControlConditions([
      wallet.user.address,
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

    // Move to next step
    setCurrentStep(CLAIM_STEPS.MINT_TICKET)
  }

  const handleClaimTicket = async () => {
    let confirmation = false
    while (!confirmation) {
      getRelayStatus(taskId).then((task) => {
        console.log({ task })
        const taskStatus = task?.taskState
        if (taskStatus === 'CheckPending') {
          confirmation = false
        } else {
          if (taskStatus === 'ExecSuccess') {
            confirmation = true
            client
              .query({
                query: FETCH_HOLDER_TICKETS,
                variables: {
                  id: wallet.user.address,
                  first: 1,
                },
              })
              .then((res) => {
                const tokenId = res.data?.holders[0]?.tickets[0].tokenId
                const body: ClaimTicketRequestBody = {
                  accountAddress: wallet.user.address,
                  claimTimestamp: `${Math.abs(
                    new Date(task?.executionDate).getTime() / 1000,
                  )}`,
                  claimTrx: task?.transactionHash,
                  email: query.emailid,
                  firstName: query.firstname,
                  lastName: query.lastname,
                  eventName: query.eventname,
                  tokenId: parseInt(tokenId),
                  isSubscribed: subscribe,
                  batchId: parseInt(query.batchid),
                  contractAddress: CONTRACT_ADDRESS,
                }
                setCurrentStep(CLAIM_STEPS.FINISHED)
                setQrData({ signature, secretHash })
                try {
                  sendInfoToServer(body)
                } catch (err) {
                  toast.error('Transaction Failed! Try Again!')
                  console.log('Error sending info to server', { err })
                }
              })
          } else if (taskStatus === 'Cancelled') {
            toast.error('Transaction Failed! Try Again!')
            confirmation = true
            setMintFailed(true)
            setCurrentStep(CLAIM_STEPS.FINISHED)
          }
        }
      })
      await delay(2000)
    }
  }

  return (
    <div className="mt-10 px-2">
      <ol className="relative border-l border-gray-200">
        <SignatureStep
          {...{ currentStep, signature, setCurrentStep, setSignature }}
        />
        <SecurityStep {...{ currentStep }} />
        <MintingStep
          {...{
            currentStep,
            setCurrentStep,
            mintFailed,
            query,
            secretHash,
            setTaskId,
            setMintFailed,
          }}
        />
        <FinalStep
          {...{
            currentStep,
            mintFailed,
            setStep,
            setCurrentStep,
            setMintFailed,
            setSignature,
          }}
        />
      </ol>
    </div>
  )
}

export default ClaimSection
