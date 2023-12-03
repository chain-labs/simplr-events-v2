import {
  CONTRACT_ADDRESS,
  GELATO_API_KEY,
  NFT_ADDRESS,
  SERVER_ENDPOINT,
  getNetwork,
} from '@/utils/constants'
import { BiconomySmartAccountV2 } from '@biconomy/account'
import {
  IHybridPaymaster,
  PaymasterMode,
  SponsorUserOperationDto,
} from '@biconomy/paymaster'
import { BigNumber, ethers, providers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import contracts from '@/contracts.json'
import { FETCH_TREE_CID, getMerkleHashes, hashQueryData } from '../utils'
import MerkleTree from 'merkletreejs'
import axios from 'axios'
import {
  GelatoRelay,
  SponsoredCallERC2771Request,
} from '@gelatonetwork/relay-sdk'

interface Props {
  smartAccount: BiconomySmartAccountV2 | null
  address: string | null
  provider: ethers.providers.Web3Provider | null
  connect: () => void
  query: object
  handleEncryptandPin: () => void
  signer: providers.JsonRpcSigner
}

const Minter: React.FC<Props> = ({
  smartAccount,
  address,
  provider,
  connect,
  query,
  handleEncryptandPin,
  signer,
}) => {
  const [proofs, setProofs] = useState(null)

  const [minted, setMinted] = useState<boolean>(false)
  const { chainId } = getNetwork()

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

  const handleMint = useCallback(async () => {
    if (smartAccount && provider && address) {
      const secretHash = handleEncryptandPin()
      try {
        const { chainId } = getNetwork()
        console.log(chainId)
        const targetAddress = NFT_ADDRESS
        const abi = [
          contracts?.[chainId][0]?.contracts?.['SimplrEvents']?.['abi'].find(
            (el) => el.name === 'mintTicket',
          ),
        ]

        const contract = new ethers.Contract(targetAddress, abi, signer)
        console.log(query)

        console.log({
          address: address,
          batchid: BigNumber.from(query?.batchid),
          hashedQuery: hashQueryData(query),
          hash: secretHash,
          proofs: proofs,
        })
        const { data } = await contract.populateTransaction.mintTicket(
          address,
          BigNumber.from(query?.batchid),
          hashQueryData(query),
          secretHash,
          proofs,
        )

        const request: SponsoredCallERC2771Request = {
          chainId: parseInt(chainId),
          target: targetAddress,
          data,
          user: address,
        }
        const relay = new GelatoRelay()

        // const pingRes = await axios.get(`${SERVER_ENDPOINT}/`)
        // if (pingRes.data === 'Server is Running') {
        const relayResponse = await relay.sponsoredCallERC2771(
          request,
          provider,
          GELATO_API_KEY,
        )
        console.log(relayResponse)
        toast.success('Transaction successful')

        // setTaskId(relayResponse.taskId)
        // setCurrentStep(CLAIM_STEPS.CLAIM_TICKET)
        // setMinting(false)
      } catch (err) {
        console.log('Transaction Error')
        console.log(err)
        toast.error('Something went wrong! Try again')
      }
    }
  }, [smartAccount, provider, address])

  useEffect(() => {
    if (smartAccount && provider && address) handleMint()
  }, [handleMint, smartAccount, provider, address])

  return (
    <>
      {!minted ? (
        <button className="my-2 bg-amber-600" onClick={connect}>
          <p className="text-md font-['Cinzel'] font-semibold">
            Claim your Gift
          </p>
        </button>
      ) : (
        <a
          href={`https://opensea.io/${address}`}
          target="_blank"
          rel="noreferrer"
        >
          <button className="my-2 bg-amber-600">
            <p className="text-md font-['Cinzel'] font-semibold text-red-600">
              View your Gift
            </p>
          </button>
        </a>
      )}
      <ToastContainer
        containerId={'toaster'}
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  )
}

export default Minter
