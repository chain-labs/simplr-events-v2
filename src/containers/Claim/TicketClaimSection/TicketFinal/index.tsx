import { client } from '@/components/ApolloClient'
import If from '@/components/If'
import FETCH_HOLDER_TICKETS from '@/graphql/query/fetchHolderTickets'
import FETCH_REVEALED from '@/graphql/query/fetchRevealed'
import {
  ENABLE_QR,
  EVENT_NAME,
  OPENSEA_URL,
  TELEGRAM_URL,
  TOKEN_NAME,
  TWITTER_URL,
} from '@/utils/constants'
import { CONTRACT_ADDRESS } from '@/utils/constants'
import { ArrowRight, TelegramFill, TwitterFill } from 'akar-icons'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Spinner from '../../components/Spinner'
import QRCodeComp from './QRCodeComp'
import { useAppSelector } from '@/redux/hooks'
import { walletSelector } from '@/redux/wallet'

const TicketFinal = ({ qrData }: { qrData: any }) => {
  const [generatingQR, setGeneratingQR] = useState(false)

  const [revealed, setRevealed] = useState<boolean>(false)
  const [ticketURI, setTicketURI] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [loading, setLoading] = useState(true)

  const wallet = useAppSelector(walletSelector)
  useEffect(() => {
    if (tokenId) {
      const setTicketDetails = async () => {
        const res = await client.query({
          query: FETCH_REVEALED,
          variables: { address: CONTRACT_ADDRESS },
        })
        const { data } = res
        const isRevealed = !!data?.simplrEvents?.[0]?.isRevealed
        const ticketURI = data?.simplrEvents?.[0]?.ticketURI
        const ticketCid = ticketURI?.split('//')[1]
        const ticketImgRes = await axios.get(
          `https://nftstorage.link/ipfs/${ticketCid}${
            isRevealed ? `${tokenId}.json` : ''
          }`,
        )
        const ticketImg = `https://nftstorage.link/ipfs/${
          ticketImgRes.data?.image.split('//')[1]
        }`
        setTicketURI(ticketImg)
        setRevealed(isRevealed)
      }
      setTicketDetails()
    }
  }, [tokenId])

  const fetchRevealed = async () => {
    const tokenIdRes = await client.query({
      query: FETCH_HOLDER_TICKETS,
      variables: {
        id: wallet.user.address,
        first: 1,
      },
    })
    const tokenId = tokenIdRes.data?.holders[0]?.tickets[0].tokenId
    setTokenId(tokenId)
  }

  useEffect(() => {
    fetchRevealed().then(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mt-40 h-16 w-16">
        <Spinner />
      </div>
    )
  }

  if (!generatingQR) {
    return (
      <div className="bg-red mt-16">
        <div className="rounded-xl bg-slate-200 py-4 shadow-xl">
          <div className="relative mt-8 h-60 w-full py-8 ">
            <Image
              src={ticketURI}
              alt="ticket image"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="mt-8 w-full border-t border-t-gray-300 pt-4">
            <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
              Your {EVENT_NAME} {TOKEN_NAME}
            </h2>
            <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
              #{tokenId}
            </h2>
            <div className="mt-6 flex justify-center gap-4">
              <If
                condition={!!TWITTER_URL}
                then={
                  <a href={TWITTER_URL} target="_blank" rel="noreferrer">
                    <button className="focus:bg-initial flex items-center rounded-lg bg-[#1da1f2] px-2 py-2.5 text-sm font-medium text-white hover:bg-[#1da1f2]">
                      <TwitterFill size={16} />
                      <h4 className="ml-2 text-sm">Share on Twitter</h4>
                    </button>
                  </a>
                }
              />
              <a
                href={`${OPENSEA_URL}${tokenId}`}
                target="_blank"
                rel="noreferrer"
              >
                <button className="focus:bg-initial flex items-center rounded-lg bg-[#2081e2] px-2 py-2.5 text-sm font-medium text-white hover:bg-[#2081e2]">
                  <h4 className="ml-2 text-sm">View on Opensea</h4>
                </button>
              </a>
            </div>
            <div className="mt-4 mb-6 flex justify-center gap-4">
              <If
                condition={!!TELEGRAM_URL}
                then={
                  <a href={TELEGRAM_URL} target="_blank" rel="noreferrer">
                    <button className="flex items-center rounded-lg bg-blue-700 px-2 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                      <TelegramFill size={16} />
                      <h4 className="ml-2 text-sm">Join Telegram</h4>
                    </button>
                  </a>
                }
              />
              <If
                condition={ENABLE_QR}
                then={
                  <button
                    className="flex items-center rounded-lg bg-emerald-500 px-2 py-2.5 text-sm font-medium text-white  hover:bg-emerald-700 focus:bg-emerald-500"
                    onClick={() => setGeneratingQR(true)}
                  >
                    <h4 className="text-sm">Generate QR Code</h4>
                  </button>
                }
              />
            </div>
            <Link href="/claim" target="_blank">
              <div className="mb-6 flex items-center justify-center">
                <h4 className="mr-1 underline">
                  View all your Claimed {TOKEN_NAME}
                </h4>
                <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    )
  } else {
    return <QRCodeComp {...{ qrData, tokenId }} />
  }
}

export default TicketFinal
