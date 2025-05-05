// email sending using nodemailer
import nodemailer from "nodemailer";

const resetPasswordEmail = async (email, token) => {
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
    const resetUrl = `${process.env.BASE_URL}/api/v1/users/reset/${token}`;

    // email content
    const mailOptions = {
      from: `"Authentication App" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Please reset your password",
      text: `
        Reset your password! Please verify your email address to complete your registration.
        ${resetUrl}
        This verification link will expire in 10 mins.
        If you did not create an account, please ignore this email.
      `,
    };

    // send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Reset password email sent: %s ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending reset password email:", error);
    return false;
  }
};

export default resetPasswordEmail;
