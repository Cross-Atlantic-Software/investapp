import nodemailer from "nodemailer";

const { SMTP_MAIL, SMTP_PASSWORD } = process.env;

// Function to create OTP email template
export function createOTPEmailTemplate(email: string, otpCode: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                background-color: #ffffff !important;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff !important;
                min-height: 100vh;
            }
            .header {
                background-color: #232f3e;
                padding: 25px;
                text-align: center;
            }
            .header h1 {
                color: #ffffff;
                margin: 0;
                font-size: 26px;
                font-weight: 600;
                letter-spacing: 1px;
                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            }
            .content {
                padding: 50px 30px;
                background-color: #ffffff !important;
                text-align: center;
                flex: 1;
            }
            .main-heading {
                font-size: 26px;
                font-weight: 600;
                color: #000000 !important;
                margin: 0 0 25px 0;
                text-align: center;
                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            }
            .intro-text {
                font-size: 17px;
                color: #333333 !important;
                margin: 0 0 40px 0;
                line-height: 1.7;
                text-align: center;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
            }
            .verification-section {
                margin: 40px 0;
                text-align: center;
            }
            .verification-label {
                font-size: 20px;
                font-weight: 600;
                color: #000000 !important;
                margin: 0 0 15px 0;
                text-align: center;
                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            }
            .verification-code {
                font-size: 42px;
                font-weight: 700;
                color: #000000 !important;
                margin: 0 0 15px 0;
                letter-spacing: 3px;
                text-align: center;
                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            }
            .validity-note {
                font-size: 15px;
                color: #666666 !important;
                margin: 0;
                text-align: center;
            }
            .footer {
                background-color: #f8f9fa !important;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
                margin-top: auto;
            }
            .footer p {
                margin: 0;
                color: #6c757d !important;
                font-size: 14px;
                line-height: 1.6;
            }
            @media (max-width: 600px) {
                .container {
                    width: 100%;
                    margin: 0;
                }
                .header {
                    padding: 20px 15px;
                }
                .header h1 {
                    font-size: 22px;
                }
                .content {
                    padding: 30px 20px;
                }
                .main-heading {
                    font-size: 22px;
                }
                .intro-text {
                    font-size: 15px;
                    max-width: 100%;
                }
                .verification-label {
                    font-size: 18px;
                }
                .verification-code {
                    font-size: 32px;
                    letter-spacing: 2px;
                }
                .validity-note {
                    font-size: 14px;
                }
                .footer {
                    padding: 25px 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Invest App</h1>
            </div>
            
            <div class="content">
                <h1 class="main-heading">Verify your email address</h1>
                
                <p class="intro-text">
                    Thanks for starting the new InvestApp account creation process. We want to make sure it's really you. Please enter the following verification code when prompted. If you don't want to create an account, you can ignore this message.
                </p>
                
                <div class="verification-section">
                    <div class="verification-label">Verification code</div>
                    <div class="verification-code">${otpCode}</div>
                    <div class="validity-note">(This code is valid for 10 minutes)</div>
                </div>
                
                <div class="footer">
                    <p>
                        If you didn't request this verification, please ignore this email.<br>
                        © 2025 InvestApp. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

export default async function sendMail(
  email: string,
  mailSubject: string,
  content: string
): Promise<void> {
  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: mailSubject,
      html: content,
    };

    await transport.sendMail(mailOptions);
    console.log("Email has been sent to:", email);
  } catch (error: any) {
    console.error("sendMail error:", error.message);
  }
}
