// email sending using nodemailer
import nodemailer from "nodemailer";

const sendVerificationEmail = async (email, token) => {
  try {
    // create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    // verification URL
    const verificationUrl = `${process.env.BASE_URL}/api/v1/users/verify/${token}`;

    // email content
    const mailOptions = {
      from: `"Authentication App" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Please verify your email address",
      text: `
        Thank you for registering! Please verify your email address to complete your registration.
        ${verificationUrl}
        This verification link will expire in 10 mins.
        If you did not create an account, please ignore this email.
      `,
    };

    // send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent: %s ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

export default sendVerificationEmail;
