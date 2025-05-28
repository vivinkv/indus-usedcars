
const nodemailer=require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,  
    secure: true,  
    auth: {
      user: process.env.MAILER_EMAIL,  
      pass: process.env.MAILER_PASSWORD,     
    },
    tls: {
      rejectUnauthorized: false,  
    },
  });

  module.exports={transporter}