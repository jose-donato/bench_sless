module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/sa',
        permanent: true,
      },
    ]
  },
}