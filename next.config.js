module.exports = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "iili.io",
        port: '',
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        port: "",
      },
      {
        protocol: "https",
        hostname: "minio.swiftsyn.com",
        port: "",
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "minio.swiftsyn.com",
        port: "",
        pathname: '/swiftsyn/**',
      }
    ],
  },
};
