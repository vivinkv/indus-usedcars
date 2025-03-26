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
        service: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD
        },
        secure:true
      },
      settings: {
        defaultFrom: process.env.SMTP_USERNAME,
        defaultReplyTo: process.env.SMTP_USERNAME,
        response_email: ''
      }
    }
  },
  // 'strapi5-excel-export': {
  //   enabled: true,
  //   resolve: './src/plugins/excel-export'
  // },
});
