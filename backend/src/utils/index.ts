import nodemailer from "nodemailer";

const { SMTP_MAIL, SMTP_PASSWORD } = process.env;

// Function to create buy confirmation email template (simplified like OTP email)
export function createBuyConfirmationEmailTemplate(
  userEmail: string, 
  companyName: string, 
  quantity: number, 
  price: number, 
  totalAmount: number
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Buy Confirmation - Invest App</title>
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
            .confirmation-section {
                margin: 40px 0;
                text-align: center;
            }
            .confirmation-label {
                font-size: 20px;
                font-weight: 600;
                color: #000000 !important;
                margin: 0 0 15px 0;
                text-align: center;
                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            }
            .confirmation-message {
                font-size: 18px;
                font-weight: 500;
                color: #28a745 !important;
                margin: 0 0 20px 0;
                text-align: center;
                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #28a745;
            }
            .transaction-details {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 5px 0;
            }
            .detail-row:last-child {
                margin-bottom: 0;
                font-weight: bold;
                color: #28a745;
                border-top: 1px solid #e9ecef;
                padding-top: 10px;
                margin-top: 10px;
            }
            .detail-label {
                font-weight: 600;
                color: #333333;
                font-size: 14px;
            }
            .detail-value {
                color: #666666;
                font-size: 14px;
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
                .confirmation-label {
                    font-size: 18px;
                }
                .confirmation-message {
                    font-size: 16px;
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
                <h1 class="main-heading">Buy Order Confirmed</h1>
                
                <p class="intro-text">
                    Your buy order has been successfully placed. Here are the details of your transaction:
                </p>
                
                <div class="confirmation-section">
                    <div class="confirmation-label">Transaction Details</div>
                    <div class="confirmation-message">
                        Buy Order Successfully Placed
                    </div>
                </div>
                
                <div class="transaction-details">
                    <div class="detail-row">
                        <span class="detail-label">Company:</span>
                        <span class="detail-value">${companyName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Quantity:</span>
                        <span class="detail-value">${quantity} shares</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Price per Share:</span>
                        <span class="detail-value">₹${price.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Amount:</span>
                        <span class="detail-value">₹${totalAmount.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>
                        Thank you for using Invest App!<br>
                        © 2025 InvestApp. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Function to create sell confirmation email template (simplified like OTP email)
export function createSellConfirmationEmailTemplate(
  userEmail: string, 
  companyName: string, 
  quantity: number, 
  sellingPrice: number, 
  totalAmount: number,
  message?: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sell Confirmation - Invest App</title>
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
            .confirmation-section {
                margin: 40px 0;
                text-align: center;
            }
            .confirmation-label {
                font-size: 20px;
                font-weight: 600;
                color: #000000 !important;
                margin: 0 0 15px 0;
                text-align: center;
                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            }
            .confirmation-message {
                font-size: 18px;
                font-weight: 500;
                color: #28a745 !important;
                margin: 0 0 20px 0;
                text-align: center;
                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #28a745;
            }
            .transaction-details {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 5px 0;
            }
            .detail-row:last-child {
                margin-bottom: 0;
                font-weight: bold;
                color: #28a745;
                border-top: 1px solid #e9ecef;
                padding-top: 10px;
                margin-top: 10px;
            }
            .detail-label {
                font-weight: 600;
                color: #333333;
                font-size: 14px;
            }
            .detail-value {
                color: #666666;
                font-size: 14px;
            }
            .message-section {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
                text-align: left;
            }
            .message-label {
                font-weight: 600;
                color: #856404;
                margin-bottom: 8px;
                font-size: 14px;
            }
            .message-text {
                color: #856404;
                font-style: italic;
                font-size: 14px;
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
                .confirmation-label {
                    font-size: 18px;
                }
                .confirmation-message {
                    font-size: 16px;
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
                <h1 class="main-heading">Sell Order Confirmed</h1>
                
                <p class="intro-text">
                    Your sell order has been successfully placed. Here are the details of your transaction:
                </p>
                
                <div class="confirmation-section">
                    <div class="confirmation-label">Transaction Details</div>
                    <div class="confirmation-message">
                        Sell Order Successfully Placed
                    </div>
                </div>
                
                <div class="transaction-details">
                    <div class="detail-row">
                        <span class="detail-label">Company:</span>
                        <span class="detail-value">${companyName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Quantity:</span>
                        <span class="detail-value">${quantity} shares</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Selling Price per Share:</span>
                        <span class="detail-value">₹${sellingPrice.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Amount:</span>
                        <span class="detail-value">₹${totalAmount.toFixed(2)}</span>
                    </div>
                </div>
                
                ${message ? `
                <div class="message-section">
                    <div class="message-label">Your Message to Buyers:</div>
                    <div class="message-text">"${message}"</div>
                </div>
                ` : ''}
                
                <div class="footer">
                    <p>
                        Thank you for using Invest App!<br>
                        © 2025 InvestApp. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

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

// Function to create super admin notification email template
export function createSuperAdminNotificationTemplate(
  userEmail: string,
  userName: string,
  companyName: string,
  quantity: number,
  price: number,
  totalAmount: number
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Stock Purchase - Invest App</title>
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
            .notification-section {
                margin: 40px 0;
                text-align: center;
            }
            .notification-label {
                font-size: 20px;
                font-weight: 600;
                color: #000000 !important;
                margin: 0 0 15px 0;
                text-align: center;
                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            }
            .notification-message {
                font-size: 18px;
                font-weight: 500;
                color: #28a745 !important;
                margin: 0 0 20px 0;
                text-align: center;
                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #28a745;
            }
            .transaction-details {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 5px 0;
            }
            .detail-row:last-child {
                margin-bottom: 0;
                font-weight: bold;
                color: #28a745;
                border-top: 1px solid #e9ecef;
                padding-top: 10px;
                margin-top: 10px;
            }
            .detail-label {
                font-weight: 600;
                color: #333333;
                font-size: 14px;
            }
            .detail-value {
                color: #666666;
                font-size: 14px;
            }
            .user-info {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .user-info h3 {
                color: #000000;
                margin: 0 0 10px 0;
                font-size: 18px;
                font-weight: 600;
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
                .notification-label {
                    font-size: 18px;
                }
                .notification-message {
                    font-size: 16px;
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
                <h1 class="main-heading">New Stock Purchase Notification</h1>
                
                <p class="intro-text">
                  ${userName} has completed a stock purchase transaction on the platform. Please review the transaction details below:
                </p>
                
                <div class="notification-section">
                    <div class="notification-label">Transaction Summary</div>
                    <div class="notification-message">
                        New stock purchase completed successfully
                    </div>
                </div>
                
                <div class="user-info">
                    <h3>User Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">User Email:</span>
                        <span class="detail-value">${userEmail}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">User Name:</span>
                        <span class="detail-value">${userName}</span>
                    </div>
                </div>
                
                <div class="transaction-details">
                    <div class="detail-row">
                        <span class="detail-label">Company:</span>
                        <span class="detail-value">${companyName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Quantity:</span>
                        <span class="detail-value">${quantity} shares</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Price per Share:</span>
                        <span class="detail-value">₹${price.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Amount:</span>
                        <span class="detail-value">₹${totalAmount.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>
                        This is an automated notification from Invest App.<br>
                        Please log into the admin panel to view more details and manage this transaction.
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
