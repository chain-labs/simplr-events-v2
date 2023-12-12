import { SmartAccountSigner } from '@alchemy/aa-core'
import {
  WalletClientSigner,
  type SmartAccountSigner,
  getDefaultEntryPointAddress,
} from '@alchemy/aa-core'

const MAGIC_API_KEY = 'pk_live_268E93CE2BC2BBB8'
export const createMagicSigner = async () => {
  const magicSigner = new MagicSigner({ apiKey: MAGIC_API_KEY })

  await magicSigner.authenticate({
    authenticate: async () => {
      await magicSigner.inner.wallet.connectWithUI()
    },
  })

  return magicSigner
}
