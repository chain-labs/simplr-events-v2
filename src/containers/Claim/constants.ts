import { TOKEN_NAME } from '@/utils/constants'

export const STEPS = {
  VERIFY_URL: 1,
  CONNECT_WALLET: 2,
  ENCRYPT_DATA: 3,
  FINISH: 4,
}

export const STEP_NAME = {
  1: 'Verify',
  2: 'Login',
  3: `Claim ${TOKEN_NAME}`,
  4: `View ${TOKEN_NAME}`,
}
