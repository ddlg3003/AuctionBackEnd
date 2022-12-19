// const nodemailer = require('nodemailer');

// const sendEmail = async options => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: process.env.SMTP_PORT,
//         auth: {
//             user: process.env.SMTP_EMAIL,
//             pass: process.env.SMTP_PASSWORD
//         }
//     });

//     const message = {
//         from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     }

//     await transporter.sendMail(message)
// }

// module.exports = sendEmail;
const sgMail = require('@sendgrid/mail');

const sendMail = async (options) => {
    sgMail.setApiKey(process.env.SMTP_API_KEY);

    const msg = {
        to: options.email, // Change to your recipient
        from: process.env.FROM_EMAIL, // Change to your verified sender
        subject: options.subject,
        // text: options.message,
        html: options.message,
      }

    await sgMail.send(msg);
}

module.exports = sendMail;