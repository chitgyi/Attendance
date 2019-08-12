module.exports = {
    devServer: {
        //disableHostCheck: true
        proxy: "https://face.ap-southeast-1.myhuaweicloud.com"
    },
    baseUrl: process.env.NODE_ENV === 'production' ? './' : '/'
    //   dev: {
    //     proxyTable: {
    //       "/": "https://face.ap-southeast-1.myhuaweicloud.com/v2/05c036d45c0026ed2fd9c00b30629671/face-sets/test/search"
    //     }
    //   }
}
