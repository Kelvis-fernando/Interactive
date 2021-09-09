module.exports = {
  transpileDependencies: ["vuetify"],

  pluginOptions: {
    i18n: {
      locale: "en-us",
      fallbackLocale: "en-us",
      localeDir: "i18n/locales",
      enableInSFC: false,
    },
  },

  pwa: {
    // workboxPluginMode: 'InjectManifest',
    // workboxOptions: {
    //   swSrc: './src/sw.ts',
    //   swDest: 'service-worker.js',
    // },
    name: 'Front-End-Web-App',
    themeColor: '#FA4600',
    manifestOptions: {
      name: "HEADER DX",
      short_name: "DX",
      description: "HEADER DX is a data-driven marketing and cloud-based solution developed for companies that are facing the challenges of disruption. It is a combination of multiples technologies and distributed services related to digital transformation to help companies create and manage its own big data environment without the complexity and costs of IT infrastructure. It brings together a bunch of new technologies like data management, cross-channel integration, real-time analytics, and mobile features to improve customer relationship and engagement.",
      start_url: "/auth/login",
      backgroundColor: "#f0f0f0",
      display: "standalone",
      icons: [
        {
          src: "/img/icons/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png"
        },
        {
          src: "/img/icons/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png"
        },
        {
          src: "/img/icons/favicon-48x48.png",
          sizes: "48x48",
          type: "image/png"
        },
      ]
    }
  }
};
