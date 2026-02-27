const nodemailer = require("nodemailer");

// ==================== TRANSPORTER (WITH CONNECTION POOLING) ====================

// Create a single reusable transporter instance (connection pooling)
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      pool: true, // ✅ Enable connection pooling
      maxConnections: 5, // ✅ Max concurrent connections
      maxMessages: 100, // ✅ Max messages per connection
      rateDelta: 1000, // ✅ 1 second between messages
      rateLimit: 5, // ✅ Max 5 emails per second
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // ✅ Connection timeout settings
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000, // 5 seconds
      socketTimeout: 20000, // 20 seconds
    });

    // ✅ Verify connection on startup (optional)
    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ Email transporter error:", error);
      } else {
        console.log("✅ Email server is ready to send messages");
      }
    });
  }

  return transporter;
};

// ==================== EMAIL TEMPLATES ====================

const emailTemplates = {
  verificationOTP: (name, otp) => ({
    subject: "Verify Your Email - ShopEasy",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px; margin: 30px 0; }
          .otp { font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; margin: 0; }
          .otp-note { color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 10px; }
          .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 8px; color: #856404; font-size: 14px; margin-top: 20px; }
          h2 { color: #333; margin-bottom: 10px; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛍️ ShopEasy</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}! 👋</h2>
            <p>Thank you for registering with ShopEasy. Please use the following OTP to verify your email address:</p>
            <div class="otp-box">
              <p class="otp">${otp}</p>
              <p class="otp-note">Valid for 10 minutes</p>
            </div>
            <p>Enter this code in the verification page to complete your registration.</p>
            <div class="warning">
              ⚠️ If you didn't create an account with ShopEasy, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>© 2024 ShopEasy. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordResetOTP: (name, otp) => ({
    subject: "Password Reset OTP - ShopEasy",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; text-align: center; border-radius: 10px; margin: 30px 0; }
          .otp { font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; margin: 0; }
          .otp-note { color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 10px; }
          .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
          .warning { background: #fee2e2; padding: 15px; border-radius: 8px; color: #991b1b; font-size: 14px; margin-top: 20px; }
          h2 { color: #333; margin-bottom: 10px; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}! 👋</h2>
            <p>We received a request to reset your password. Use the following OTP to proceed:</p>
            <div class="otp-box">
              <p class="otp">${otp}</p>
              <p class="otp-note">Valid for 10 minutes</p>
            </div>
            <p>Enter this code to create a new password.</p>
            <div class="warning">
              🚨 If you didn't request a password reset, please ignore this email and make sure your account is secure.
            </div>
          </div>
          <div class="footer">
            <p>© 2024 ShopEasy. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordChanged: (name) => ({
    subject: "Password Changed Successfully - ShopEasy",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d1fae5; padding: 20px; text-align: center; border-radius: 10px; margin: 30px 0; }
          .success-box p { color: #065f46; font-size: 18px; margin: 0; font-weight: 600; }
          .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 8px; color: #92400e; font-size: 14px; margin-top: 20px; }
          h2 { color: #333; margin-bottom: 10px; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Changed</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}! 👋</h2>
            <div class="success-box">
              <p>Your password has been changed successfully!</p>
            </div>
            <p>You can now login with your new password.</p>
            <div class="warning">
              ⚠️ If you didn't make this change, please contact our support team immediately and secure your account.
            </div>
          </div>
          <div class="footer">
            <p>© 2024 ShopEasy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  welcomeEmail: (name) => ({
    subject: "Welcome to ShopEasy! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 32px; }
          .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; }
          .benefits { background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 30px 0; }
          .benefit-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #e9ecef; }
          .benefit-item:last-child { border-bottom: none; }
          .benefit-icon { font-size: 24px; margin-right: 15px; }
          .benefit-text { color: #495057; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
          h2 { color: #333; margin-bottom: 10px; }
          p { color: #666; line-height: 1.6; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ShopEasy! 🛍️</h1>
          </div>
          <div class="content">
            <h2>Hey ${name}! 🎉</h2>
            <p>Your account has been verified successfully. Welcome to the ShopEasy family!</p>
            
            <div class="benefits">
              <h3 style="margin-top: 0; color: #333;">Your Member Benefits:</h3>
              <div class="benefit-item">
                <span class="benefit-icon">💰</span>
                <span class="benefit-text"><strong>₹100 off</strong> on your first order</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">🚚</span>
                <span class="benefit-text"><strong>Free delivery</strong> on orders above ₹999</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">🎟️</span>
                <span class="benefit-text"><strong>Exclusive coupons</strong> for members only</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">⭐</span>
                <span class="benefit-text"><strong>Reward points</strong> on every purchase</span>
              </div>
            </div>
            
            <div class="center">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" class="cta-button">Start Shopping</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 ShopEasy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// ==================== SEND EMAIL FUNCTION (WITH RETRY) ====================

const sendEmail = async (to, template, ...args) => {
  try {
    // ✅ Skip email in development if no credentials (log only)
    if (
      process.env.NODE_ENV === "development" &&
      (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
    ) {
      console.log("📧 [DEV MODE] Email would be sent to:", to);
      console.log("📧 [DEV MODE] Template:", template);
      console.log("📧 [DEV MODE] Args:", args);
      return true;
    }

    // ✅ Validate template exists
    if (!emailTemplates[template]) {
      throw new Error(`Email template "${template}" not found`);
    }

    const transporter = getTransporter();
    const { subject, html } = emailTemplates[template](...args);

    const mailOptions = {
      from: `"ShopEasy" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    // ✅ Send email with retry logic
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(
          `✅ Email sent successfully to ${to} (${subject}) - Message ID: ${info.messageId}`,
        );
        return true;
      } catch (error) {
        lastError = error;
        console.error(
          `❌ Email send attempt ${attempt} failed:`,
          error.message,
        );

        // Wait before retry (exponential backoff)
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    // All retries failed
    throw lastError;
  } catch (error) {
    console.error("❌ Email error (all retries failed):", error);
    // ✅ DON'T throw - just log the error (emails are non-critical)
    return false;
  }
};

// ==================== CLEANUP ON SHUTDOWN ====================

// Close transporter pool on app shutdown
process.on("SIGTERM", () => {
  if (transporter) {
    transporter.close();
    console.log("📧 Email transporter closed");
  }
});

module.exports = { sendEmail };
