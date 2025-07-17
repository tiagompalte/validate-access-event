const nextConfig = {
    env: {
        PRIVATE_KEY: process.env.PRIVATE_KEY,
        ETH_RPC_URL: process.env.ETH_RPC_URL,
        CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
      }
}

export default nextConfig;
