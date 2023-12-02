export const networks = {
  137: {
    name: 'Polygon Mainnet',
    id: 'matic',
  },
  80001: {
    name: 'Polygon Testnet',
    id: 'mumbai',
  },
}

export const test_networks = {
  80001: {
    name: 'Polygon Testnet',
    id: 'mumbai',
  },
}

export const getNetworkList = (test) => {
  if (test) {
    return test_networks
  } else return networks
}

export const rpc_urls = {
  137: 'https://polygon-rpc.com',
  80001: 'https://rpc-mumbai.matic.today',
}

export const contractType = {
  ERC721: 1,
  ERC721A: 2,
}
