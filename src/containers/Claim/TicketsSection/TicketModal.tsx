import If from '@/components/If'
import {
  ENABLE_QR,
  OPENSEA_URL,
  TELEGRAM_URL,
  TOKEN_NAME,
  TWITTER_URL,
} from '@/utils/constants'
import { ArrowRight, CircleXFill, TelegramFill, TwitterFill } from 'akar-icons'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import QRCodeContent from './QRCodeContent'

interface Props {
  modalData: any
  setModalOpen: (boolean) => void
  setModalData: (any) => void
  ticketURI: string
}

const TicketModal = ({ setModalOpen, modalData, setModalData }: Props) => {
  const [generatingQR, setGeneratingQR] = useState(false)

  return (
    <div className="fixed top-0 left-0 z-10 h-screen w-screen bg-modal-bg">
      <div className="absolute top-0 h-1/2 w-full rounded-b-lg bg-gray-200">
        <div
          className="absolute right-4 top-4"
          onClick={() => {
            setModalOpen(false)
            setModalData({})
          }}
        >
          <CircleXFill size={24} />
        </div>
        <If
          condition={!generatingQR}
          then={
            <React.Fragment>
              <div className="rounded-xl bg-slate-200 py-4 shadow-xl">
                <div className="relative mt-8 h-60 w-full py-8 ">
                  <Image
                    src={modalData.ticketImg}
                    alt="ticket image"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="mt-8 w-full border-t border-t-gray-300 pt-4">
                  <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
                    {`#${modalData?.tokenId} ${modalData?.eventName}`}
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
                    {/* <button className="focus:bg-initial flex items-center rounded-lg bg-gradient-instagram px-2 py-2.5 text-sm font-medium text-white hover:bg-[#1da1f2]">
                      <InstagramFill size={16} />
                      <h4 className="ml-2 text-sm">Brag on Instagram</h4>
                    </button> */}
                    <a
                      href={`${OPENSEA_URL}${modalData.tokenId}`}
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
                          <button className="flex items-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
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
                          className="flex items-center rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white  hover:bg-emerald-700 focus:bg-emerald-500"
                          onClick={() => setGeneratingQR(true)}
                        >
                          <h4 className="text-sm">Generate QR Code</h4>
                        </button>
                      }
                    />
                  </div>
                </div>
              </div>
            </React.Fragment>
          }
          else={<QRCodeContent modalData={modalData} />}
        />
      </div>
    </div>
  )
}

export default TicketModal
