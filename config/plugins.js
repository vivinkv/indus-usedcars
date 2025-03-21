module.exports = () => ({
  documentation: {
    enabled: false,
  },
  seo: {
    enabled: true,
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD
        }
      },
      settings: {
        defaultFrom: process.env.SMTP_USERNAME
      }
    }
  },
  // 'strapi5-excel-export': {
  //   enabled: true,
  //   resolve: './src/plugins/excel-export'
  // },
});
