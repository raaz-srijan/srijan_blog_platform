const { transporter } = require("./transporter");

async function sendVerificationEmail(recipientEmail, token) {
  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify/${token}`;

  const subject = "Verify Your Email – Blog Platform";

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #e5e5e5;border-radius:12px;background:#fafafa;">
      <h2 style="color:#004E92;margin-bottom:8px;">Welcome to Srijan Blog Plaform!</h2>
      <p style="color:#333;margin-bottom:24px;">
        Please confirm your email address by clicking the button below.
      </p>

      <a href="${verificationUrl}"
         style="display:inline-block;background:#004E92;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
        Verify Email
      </a>

      <p style="margin-top:24px;font-size:0.9rem;color:#666;">
        Or copy & paste this link into your browser:<br/>
        <a href="${verificationUrl}" style="color:#004E92;word-break:break-all;">${verificationUrl}</a>
      </p>

      <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
      <p style="font-size:0.8rem;color:#999;">
        If you didn’t sign up for Srijan Blog Plaform, you can safely ignore this email.
      </p>
    </div>
  `;

  const text = `
Dear Customer,

Please verify your email by clicking the link below:

${verificationUrl}

If you didn’t request this, you can ignore this email.
`;

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: recipientEmail,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to", recipientEmail);
  } catch (error) {
    console.error("Failed to send verification email:", error.message);
    console.error(error.stack);
  }
}


async function sendPasswordResetEmail(recipientEmail, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
  const subject = "Reset Your Password – Srijan Blog Plaform";

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #e5e5e5;border-radius:12px;background:#fafafa;">
      <h2 style="color:#004E92;margin-bottom:8px;">Reset Your Password</h2>
      <p style="color:#333;margin-bottom:24px;">
        You requested a password reset. Click the button below to set a new password.
      </p>

      <a href="${resetUrl}"
         style="display:inline-block;background:#004E92;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
        Reset Password
      </a>

      <p style="margin-top:24px;font-size:0.9rem;color:#666;">
        Or copy & paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color:#004E92;word-break:break-all;">${resetUrl}</a>
      </p>

      <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
      <p style="font-size:0.8rem;color:#999;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  const text = `
Reset Your Password

Click the link below to reset your password:
${resetUrl}

If you didn't request this, you can ignore this email.
`;

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: recipientEmail,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to", recipientEmail);
  } catch (error) {
    console.error("Failed to send password reset email:", error.message);
  }
}

module.exports = { sendVerificationEmail,  sendPasswordResetEmail };