import axios from 'axios'
import React, { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import Spinner from '../../components/Spinner'
import LitJsSdk from '@lit-protocol/sdk-browser'
import { getNetwork, TOKEN_NAME } from '@/utils/constants'
import { utf8ToHex } from '../../utils'
import { CONTRACT_ADDRESS } from '@/utils/constants'
import { useAppSelector } from '@/redux/hooks'
import { walletSelector } from '@/redux/wallet'

const QRCodeComp = ({ qrData, tokenId }: { qrData: any; tokenId: string }) => {
  const [loading, setLoading] = useState(true)
  const [qrValue, setQrValue] = useState('')

  const wallet = useAppSelector(walletSelector)

  const onImageDownload = () => {
    const svg = document.getElementById('QRCode')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width + 200
      canvas.height = img.height + 200
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(
        img,
        canvas.width / 2 - img.width / 2,
        canvas.height / 2 - img.height / 2,
      )
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `#${tokenId}_${TOKEN_NAME}.png`
      downloadLink.href = `${pngFile}`
      downloadLink.click()
    }
    img.src = `data:image/svg+xml;base64,${Buffer.from(svgData).toString(
      'base64',
    )}`
  }

  const handleDecrypt = async (dataCid, signature) => {
    const litClient = new LitJsSdk.LitNodeClient()
    await litClient.connect()
    const dataRes = await axios.get(
      `https://simplr.mypinata.cloud/ipfs/${dataCid}`,
    )
    const data = dataRes.data
    const { data: encryptedString } = await axios({
      url: `https://simplr.mypinata.cloud/ipfs/${data?.secret?.encryptedStringHash}`,
      method: `get`,
      responseType: `blob`,
    })
    const network = getNetwork()
    const encryptionKeyBody = {
      accessControlConditions: data?.secret?.accessControlConditions,
      toDecrypt: data?.secret?.encryptedSymmetricKey,
      chain: network.name,
      authSig: signature,
    }
    const symmetricKey = await litClient.getEncryptionKey(encryptionKeyBody)
    return await LitJsSdk.decryptString(encryptedString, symmetricKey)
  }

  const handleQrGenerate = async (details) => {
    const concatenatedMessage = `${details?.emailid}-${wallet.user.address}-${tokenId}-${CONTRACT_ADDRESS}`

    const message = utf8ToHex(concatenatedMessage)
    console.log({ concatenatedMessage, message })

    const signer = wallet.provider?.getSigner()
    const signature = await signer.signMessage(message)
    const qrCodeData = {
      tokenId,
      message,
      contractAddress: CONTRACT_ADDRESS,
      signature,
    }
    setQrValue(JSON.stringify(qrCodeData))
    setLoading(false)
  }

  useEffect(() => {
    const { signature, secretHash } = qrData
    handleDecrypt(secretHash, signature).then((data) => {
      const details = JSON.parse(data)
      handleQrGenerate(details)
    })
  }, [])

  if (!loading) {
    return (
      <div className="flex h-full w-full flex-col items-center bg-white pt-8">
        <QRCode value={qrValue} id="QRCode" />
        <button
          className="mt-4 rounded-lg bg-green-500 px-5 py-2.5 text-sm font-medium text-white"
          onClick={() => onImageDownload()}
        >
          Download QR Code
        </button>
      </div>
    )
  } else {
    return (
      <div className="mt-24 flex flex-col items-center justify-center ">
        <div className="h-16 w-16">
          <Spinner />
        </div>
        <div>Generating your QR Code...</div>
      </div>
    )
  }
}

export default QRCodeComp
