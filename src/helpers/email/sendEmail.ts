import nodemailer from "nodemailer";
import config from "../../config";

// async..await is not allowed in global scope, must use a wrapper
const EmailSender = async (data: Models.Email) => {
  // Generate test SMTP service account from ethereal.email

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: config.SMTP_ENDPOINT,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.SMTP_USER, // generated ethereal user
      pass: config.SMTP_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: config.SMTP_FROM, // sender address
    to: data.to, // list of receivers
    subject: data.subject, // Subject line
    text: data.text, // plain text body
    html: data.html, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
//   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

export default EmailSender;