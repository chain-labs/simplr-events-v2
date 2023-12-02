import Head from 'next/head'
import { ParticleAuthModule, ParticleProvider } from '@biconomy/particle-auth'
import {
  PARTICLE_PROJECT_ID,
  PARTICLE_CLIENT_KEY,
  PARTICLE_APP_ID,
  PAYMASTER_URL,
} from '@/utils/constants'

import { useState } from 'react'
import { IBundler, Bundler } from '@biconomy/bundler'
import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from '@biconomy/account'
import { ethers } from 'ethers'
import { ChainId } from '@biconomy/core-types'
import { IPaymaster, BiconomyPaymaster } from '@biconomy/paymaster'
import {
  ECDSAOwnershipValidationModule,
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
} from '@biconomy/modules'
import Image from 'next/image'
import Minter from './Minter'

export default function Home() {
  const [address, setAddress] = useState<string>('')
  const [name, setName] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null)
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(
    null,
  )

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

      const biconomySmartAccount = await BiconomySmartAccountV2.create({
        chainId: ChainId.POLYGON_MAINNET,
        bundler: bundler,
        paymaster: paymaster,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        defaultValidationModule: module_var,
        activeValidationModule: module_var,
      })

      setAddress(await biconomySmartAccount.getAccountAddress())
      console.log({ biconomySmartAccount })

      setSmartAccount(biconomySmartAccount)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  const bundler: IBundler = new Bundler({
    bundlerUrl: 'https://bundler.particle.network?chainId=137',
    chainId: ChainId.POLYGON_MAINNET,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  })

  console.log({ PAYMASTER_URL })

  const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl: PAYMASTER_URL,
  })
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
          />
          <p className="max-w-[200px] text-center">Hello from this side</p>
        </div>
      </main>
    </>
  )
}
