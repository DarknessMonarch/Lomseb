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
        hostname: "minioapi.swiftsyn.com",
        port: "",
      }
    ],
  },
};
