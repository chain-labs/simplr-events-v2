import { NFT_ADDRESS } from '@/utils/constants'
import { BiconomySmartAccountV2 } from '@biconomy/account'
import {
  IHybridPaymaster,
  PaymasterMode,
  SponsorUserOperationDto,
} from '@biconomy/paymaster'
import { BigNumber, ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const nftAddress = NFT_ADDRESS
const abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_buyer',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_quantity',
        type: 'uint256',
      },
    ],
    name: 'buy',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
]

interface Props {
  smartAccount: BiconomySmartAccountV2 | null
  address: string | null
  provider: ethers.providers.Provider | null
  connect: () => void
}

const Minter: React.FC<Props> = ({
  smartAccount,
  address,
  provider,
  connect,
}) => {
  const [minted, setMinted] = useState<boolean>(false)

  const handleMint = useCallback(async () => {
    if (smartAccount && provider && address) {
      const contract = new ethers.Contract(nftAddress, abi, provider)
      try {
        toast.info('Wrapping up your Gift....', {
          position: 'top-right',
          autoClose: 15000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        })
        const minTx = await contract.populateTransaction.buy(address, 1, {
          value: BigNumber.from(0),
        })
        const tx1 = {
          to: nftAddress,
          data: minTx.data,
        }
        console.log({ tx1, smartAccount })

        const userOp = await smartAccount.buildUserOp([tx1], {
          overrides: {
            maxFeePerGas: BigNumber.from(1),
            maxPriorityFeePerGas: BigNumber.from(1),
          },
        })
        console.log({ userOp, smartAccount })

        const biconomyPaymaster =
          smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>
        console.log({ biconomyPaymaster })

        const paymasterServiceData: SponsorUserOperationDto = {
          mode: PaymasterMode.SPONSORED,
          smartAccountInfo: {
            name: 'BICONOMY',
            version: '2.0.0',
          },
        }
        console.log({ paymasterServiceData })

        const paymasterAndDataResponse =
          await biconomyPaymaster.getPaymasterAndData(
            userOp,
            paymasterServiceData,
          )
        console.log({ paymasterAndDataResponse })

        userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData
        console.log({ smartAccount, paymasterAndDataResponse, userOp })
        const userOpResponse = await smartAccount.sendUserOp(userOp)
        console.log({ userOpResponse })
        const { receipt } = await userOpResponse.wait()
        setMinted(true)
        toast.success(
          `🪔✨ Your gift has sparked joy! 🎁 May it light up your loved one's Diwali. ✨`,
          {
            position: 'top-right',
            autoClose: 18000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'dark',
          },
        )
        console.log({ txHash: receipt.transactionHash })
      } catch (err) {
        console.error({ err })
        toast.error(`Something Went Wrong!`, {
          position: 'top-right',
          autoClose: 18000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        })
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
