module.exports = {
  provider: 'nodemailer',
  providerOptions: {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  settings: {
    defaultFrom: process.env.SMTP_USERNAME,
    defaultReplyTo: process.env.SMTP_USERNAME,
  },
};