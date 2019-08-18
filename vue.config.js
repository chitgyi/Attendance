module.exports = {
  devServer: {
    // disableHostCheck: true
    proxy: 'https://face.ap-southeast-1.myhuaweicloud.com'
  },
  baseUrl: process.env.NODE_ENV === 'production' ? './' : '/'
}
