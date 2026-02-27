const nodemailer = require("nodemailer");

// ==================== TRANSPORTER ====================

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    // ✅ Check if credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ EMAIL_USER or EMAIL_PASS is missing in .env file!");
      console.error("📧 EMAIL_USER:", process.env.EMAIL_USER || "NOT SET");
      console.error(
        "📧 EMAIL_PASS:",
        process.env.EMAIL_PASS ? "SET" : "NOT SET",
      );
      return null;
    }

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 20000,
      // ✅ Add debug for development
      debug: process.env.NODE_ENV === "development",
      logger: process.env.NODE_ENV === "development",
    });

    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.error(
          "❌ Email transporter verification failed:",
          error.message,
        );
        console.error("📧 Check your EMAIL_USER and EMAIL_PASS in .env");
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
            <p>© 2026 ShopEasy. All rights reserved.</p>
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
            <p>© 2026 ShopEasy. All rights reserved.</p>
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
            <p>© 2026 ShopEasy. All rights reserved.</p>
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
            <p>© 2026 ShopEasy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// ==================== SEND EMAIL FUNCTION ====================

const sendEmail = async (to, template, ...args) => {
  try {
    console.log("📧 ========== EMAIL SERVICE ==========");
    console.log("📧 Attempting to send email...");
    console.log("📧 To:", to);
    console.log("📧 Template:", template);
    console.log("📧 Args:", args);

    // ✅ Validate email credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ EMAIL CREDENTIALS MISSING!");
      console.error("📧 EMAIL_USER:", process.env.EMAIL_USER || "NOT SET");
      console.error(
        "📧 EMAIL_PASS:",
        process.env.EMAIL_PASS ? "SET (hidden)" : "NOT SET",
      );
      console.error(
        "📧 Please set EMAIL_USER and EMAIL_PASS in your .env file",
      );

      // ✅ In development, log OTP for testing even if email fails
      if (process.env.NODE_ENV === "development") {
        console.log("🔑 ========== DEV MODE OTP ==========");
        console.log("🔑 OTP for testing:", args[1] || args[0]);
        console.log("🔑 ==================================");
      }

      return false;
    }

    // ✅ Validate template exists
    if (!emailTemplates[template]) {
      console.error(`❌ Email template "${template}" not found`);
      return false;
    }

    const transporter = getTransporter();

    if (!transporter) {
      console.error("❌ Failed to create email transporter");
      return false;
    }

    const { subject, html } = emailTemplates[template](...args);

    const mailOptions = {
      from: `"ShopEasy" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    console.log("📧 Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    // ✅ Send email with retry logic
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📧 Send attempt ${attempt}/3...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully!`);
        console.log(`✅ Message ID: ${info.messageId}`);
        console.log(`✅ Response: ${info.response}`);
        return true;
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error.message);

        if (attempt < 3) {
          console.log(`⏳ Waiting ${attempt} second(s) before retry...`);
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    // All retries failed
    console.error("❌ All email send attempts failed");
    console.error("❌ Last error:", lastError.message);

    // ✅ In development, log OTP for testing even if email fails
    if (process.env.NODE_ENV === "development") {
      console.log("🔑 ========== DEV MODE OTP ==========");
      console.log("🔑 OTP for testing:", args[1] || args[0]);
      console.log("🔑 ==================================");
    }

    return false;
  } catch (error) {
    console.error("❌ Email error:", error.message);

    // ✅ In development, log OTP for testing even if email fails
    if (process.env.NODE_ENV === "development") {
      console.log("🔑 ========== DEV MODE OTP ==========");
      console.log("🔑 OTP for testing:", args[1] || args[0]);
      console.log("🔑 ==================================");
    }

    return false;
  }
};

// ==================== TEST EMAIL FUNCTION ====================

const testEmailConnection = async () => {
  console.log("📧 ========== TESTING EMAIL CONNECTION ==========");
  console.log("📧 EMAIL_HOST:", process.env.EMAIL_HOST || "smtp.gmail.com");
  console.log("📧 EMAIL_PORT:", process.env.EMAIL_PORT || 587);
  console.log("📧 EMAIL_USER:", process.env.EMAIL_USER || "NOT SET");
  console.log(
    "📧 EMAIL_PASS:",
    process.env.EMAIL_PASS ? "SET (hidden)" : "NOT SET",
  );

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Cannot test - credentials missing!");
    return false;
  }

  const transporter = getTransporter();
  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    console.log("✅ Email connection verified successfully!");
    return true;
  } catch (error) {
    console.error("❌ Email connection failed:", error.message);
    return false;
  }
};

// ==================== CLEANUP ====================

process.on("SIGTERM", () => {
  if (transporter) {
    transporter.close();
    console.log("📧 Email transporter closed");
  }
});

module.exports = { sendEmail, testEmailConnection };
