module.exports = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "minioapi.swiftsyn.com",
        port: "",
      }
    ],
  },
};
