import LitJsSdk from '@lit-protocol/sdk-browser'

const client = new LitJsSdk.LitNodeClient()

class Lit {
  private litNodeClient
  async connect() {
    await client.connect()
    this.litNodeClient = client
  }
}

export default new Lit()
