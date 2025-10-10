/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_HEDERA_RPC_URL: process.env.NEXT_PUBLIC_HEDERA_RPC_URL,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_TICTACTOE_CONTRACT: process.env.NEXT_PUBLIC_TICTACTOE_CONTRACT,
    NEXT_PUBLIC_STAKING_CONTRACT: process.env.NEXT_PUBLIC_STAKING_CONTRACT,
    NEXT_PUBLIC_PYUSD_TOKEN: process.env.NEXT_PUBLIC_PYUSD_TOKEN,
  },
};

module.exports = nextConfig;
