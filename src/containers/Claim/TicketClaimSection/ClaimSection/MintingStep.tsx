import If from '@/components/If'
import {
  CONTRACT_ADDRESS,
  GELATO_API_KEY,
  getNetwork,
  SERVER_ENDPOINT,
  TOKEN_NAME,
} from '@/utils/constants'
import { BigNumber, ethers } from 'ethers'
import React, { useEffect, useState } from 'react'
import ClaimStepItem from './components/ClaimStepItem'
import { CLAIM_STEPS } from './constants'

import contracts from '@/contracts.json'
import { QueryProps } from '../../types'
import { FETCH_TREE_CID, getMerkleHashes, hashQueryData } from '../../utils'
import MerkleTree from 'merkletreejs'
import {
  GelatoRelay,
  SponsoredCallERC2771Request,
} from '@gelatonetwork/relay-sdk'
import { ChevronRight } from 'akar-icons'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useAppSelector } from '@/redux/hooks'
import { walletSelector } from '@/redux/wallet'

interface Props {
  currentStep: number
  mintFailed: boolean
  query: QueryProps
  secretHash: string
  setCurrentStep: (number) => void
  setTaskId: (string) => void
  setMintFailed: (boolean) => void
}

const MintingStep = ({
  currentStep,
  setCurrentStep,
  mintFailed,
  query,
  secretHash,
  setTaskId,
  setMintFailed,
}: Props) => {
  const [minting, setMinting] = useState(false)
  const [proofs, setProofs] = useState(null)
  const [waitingforUser, setWaitingForUser] = useState(true)

  useEffect(() => {
    FETCH_TREE_CID(query?.batchid).then((data) => {
      const hashCID = data.batches[0].cid
      getMerkleHashes(hashCID).then((hashes) => {
        const leafs = hashes.map((entry) => ethers.utils.keccak256(entry))
        const tree = new MerkleTree(leafs, ethers.utils.keccak256, {
          sortPairs: true,
        })
        const leaf = ethers.utils.keccak256(hashQueryData(query))
        const proofs = tree.getHexProof(leaf)
        setProofs(proofs)
      })
    })
  }, [])

  const wallet = useAppSelector(walletSelector)
  const handleTicketMinting = async (e) => {
    e.preventDefault()
    setWaitingForUser(false)

    setMinting(true)
    const signer = wallet.provider?.getSigner()
    const { chainId } = getNetwork()
    const targetAddress = CONTRACT_ADDRESS
    const abi = [
      contracts?.[chainId][0]?.contracts?.['SimplrEvents']?.['abi'].find(
        (el) => el.name === 'mintTicket',
      ),
    ]

    const contract = new ethers.Contract(targetAddress, abi, signer)

    const { data } = await contract.populateTransaction.mintTicket(
      wallet.user.address,
      BigNumber.from(query.batchid),
      hashQueryData(query),
      secretHash,
      proofs,
    )

    const request: SponsoredCallERC2771Request = {
      chainId: parseInt(chainId),
      target: targetAddress,
      data,
      user: wallet.user.address,
    }
    const relay = new GelatoRelay()

    const pingRes = await axios.get(`${SERVER_ENDPOINT}/ping`)
    if (pingRes.data === 'Server is Running') {
      const relayResponse = await relay.sponsoredCallERC2771(
        request,
        wallet.provider,
        GELATO_API_KEY,
      )

      setTaskId(relayResponse.taskId)
      setCurrentStep(CLAIM_STEPS.CLAIM_TICKET)
      setMinting(false)
    } else {
      toast.error('Something went wrong! Try again')
      setCurrentStep(CLAIM_STEPS.GET_SIGNATURE)
      setMintFailed(true)
      setMinting(false)
    }
  }

  return (
    <ClaimStepItem
      step={CLAIM_STEPS.MINT_TICKET}
      currentStep={currentStep}
      label={`Claim ${TOKEN_NAME}`}
      failed={mintFailed}
      waitForUser={waitingforUser}
    >
      <If
        condition={currentStep === CLAIM_STEPS.MINT_TICKET}
        then={
          <React.Fragment>
            <h4 className="text-sm font-medium">
              {
                "Allow us to send you the masterpiece. (It won't cost you a dime!)"
              }
            </h4>
            <button
              className="mt-2 flex items-center gap-x-1 rounded-full bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              onClick={handleTicketMinting}
              disabled={minting}
            >
              Claim {TOKEN_NAME}
              <div className="animate-bounce-right">
                <ChevronRight size={18} />
              </div>
            </button>
            <If
              condition={!waitingforUser}
              then={
                <h3 className="mt-2 text-sm font-medium">{`"Approve" the pop up, wait for a minute and that will be a wrap!`}</h3>
              }
            />
          </React.Fragment>
        }
      />
    </ClaimStepItem>
  )
}

export default MintingStep
