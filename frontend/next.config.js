/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    // Ignore React Native modules that aren't needed in web builds
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
      'react-native-get-random-values': false,
      'react-native-fast-image': false,
    };

    // Handle warnings from web3 libraries
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve '@react-native-async-storage\/async-storage'/,
      /Module not found: Can't resolve 'pino-pretty'/,
    ];

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
