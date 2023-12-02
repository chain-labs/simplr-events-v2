import { client } from '@/components/ApolloClient'
import If from '@/components/If'
import FETCH_HOLDER_TICKETS, {
  ITicket,
} from '@/graphql/query/fetchHolderTickets'
import FETCH_REVEALED from '@/graphql/query/fetchRevealed'
import { TOKEN_NAME } from '@/utils/constants'
import { CONTRACT_ADDRESS } from '@/utils/constants'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Spinner from '../components/Spinner'
import TicketModal from './TicketModal'
import { useAppSelector } from '@/redux/hooks'
import { walletSelector } from '@/redux/wallet'
import UserWelcome from '../components/UserWelcome'

const LoggedIn = () => {
  const [userTickets, setUserTickets] = useState<ITicket[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [revealed, setRevealed] = useState<boolean>(false)
  const [ticketURI, setTicketURI] = useState('')

  const fetchRevealed = async () => {
    const res = await client.query({
      query: FETCH_REVEALED,
      variables: { address: CONTRACT_ADDRESS },
    })

    const isRevealed = !!res?.data?.simplrEvents?.[0]?.isRevealed
    const ticketURI = res?.data?.simplrEvents?.[0]?.ticketURI
    const ticketCid = ticketURI?.split('//')[1]
    setTicketURI(`https://nftstorage.link/ipfs/${ticketCid}`)
    setRevealed(isRevealed)
  }

  useEffect(() => {
    fetchRevealed().then(() => setLoading(false))
  }, [])

  const wallet = useAppSelector(walletSelector)

  const getHolderTickets = async (address) => {
    const res = await client.query({
      query: FETCH_HOLDER_TICKETS,
      variables: {
        id: address,
        first: 10,
      },
    })
    const tickets = res?.data?.holders?.[0]?.tickets
    setUserTickets(tickets)
  }

  useEffect(() => {
    if (wallet.user?.address) {
      getHolderTickets(wallet.user.address)
    }
  }, [wallet.user])

  useEffect(() => {
    if (typeof window != undefined) {
      if (modalOpen) document.querySelector('html').style.overflow = 'hidden'
      else document.querySelector('html').style.overflow = 'auto'
    }
  }, [modalOpen])

  return (
    <div className="px-4 text-black">
      <If
        condition={modalOpen}
        then={
          <TicketModal
            {...{ modalData, setModalData, setModalOpen, ticketURI }}
          />
        }
      />
      <UserWelcome />
      <h2 className="mt-3 mb-4 text-3xl font-semibold">Your {TOKEN_NAME}</h2>
      <If
        condition={loading}
        then={
          <div className="mt-16 h-16 w-16">
            <Spinner />
          </div>
        }
        else={
          <If
            condition={!!userTickets?.length}
            then={
              <div className="grid max-h-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {/* <div className="flex h-full w-full flex-col items-center justify-center rounded-md border border-dashed border-slate-400 ">
          <CirclePlusFill strokeWidth={2} size={48} />
          <h4 className="mt-4 text-sm font-medium">Claim a Ticket</h4>
        </div> */}
                {userTickets?.map((ticket) => {
                  return (
                    <TicketTile
                      key={ticket.dataCid}
                      ticket={ticket}
                      ticketURI={ticketURI}
                      setModalData={setModalData}
                      setModalOpen={setModalOpen}
                      isRevealed={revealed}
                    />
                  )
                })}
              </div>
            }
            else={
              <h3 className="mt-10 text-sm">No {TOKEN_NAME} Claimed yet</h3>
            }
          />
        }
      />
    </div>
  )
}

export default LoggedIn

const TicketTile = ({
  ticket,
  setModalOpen,
  setModalData,
  ticketURI,
  isRevealed,
}: {
  ticket: ITicket
  setModalOpen: (boolean) => void
  setModalData: (any) => void
  ticketURI: string
  isRevealed: boolean
}) => {
  const [ticketImg, setTicketImg] = useState('')

  useEffect(() => {
    axios
      .get(isRevealed ? `${ticketURI}/${ticket.tokenId}.json` : ticketURI)
      .then((res) => {
        console.log({ res: res.data })

        const imageCID = res.data.image.split('//')[1]
        console.log({ imageCID })

        setTicketImg(`https://nftstorage.link/ipfs/${imageCID}`)
      })
  }, [])

  return (
    <div
      className="w-full rounded-md border border-slate-300 bg-gray-100 py-4"
      onClick={() => {
        setModalOpen(true)
        setModalData({
          dataCid: ticket?.dataCid,
          tokenId: ticket?.tokenId,
          eventName: ticket?.simplrEvent?.name,
          ticketImg,
        })
      }}
    >
      <div className="relative mb-4 h-24 w-full md:h-32 lg:h-48">
        <Image
          src={ticketImg}
          fill
          alt="ticket_img"
          style={{ objectFit: 'contain' }}
        />
      </div>
      <h3 className="text-md px-4 font-semibold">{`#${ticket.tokenId} ${ticket?.simplrEvent?.name}`}</h3>
    </div>
  )
}
