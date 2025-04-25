const nodemailer = require('nodemailer');

const logoImage  = 'https://example.com/assets/Logo2Transparent.png';
const CoverGifGIF = 'https://example.com/assets/loginGIF.gif';
const FooterImage = 'https://example.com/assets/footer.png';

const sendVerificationEmail = async (email, firstName, lastName, verificationCode) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'notMonkeytype@gmail.com',
                pass: 'vgkw lmdu aazc yocm'
            }
        });

        const emailBodyHTML = `
        <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; background-color: #0a0a1a; color: #ffffff;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;">
        <tr>
            <td align="center" valign="top" style="padding: 40px 10px;">
                <!-- Main Email Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #0d1117; border-radius: 8px; border: 1px solid #00e5ff20; box-shadow: 0 4px 20px rgba(0, 229, 255, 0.15);">
                    <!-- Header with Logo -->
                    <tr>
                        <td align="center" valign="top" style="padding: 40px 20px 30px 20px; border-bottom: 1px solid #00e5ff20;">
                            <!-- Logo -->
                            <img src="https://i.ibb.co/CpDC2cmp/nmt.png" alt="notMonkeyType Logo" width="120" style="display: block; border: 0;" />
                            <!-- Decorative Line -->
                            <table border="0" cellpadding="0" cellspacing="0" width="80%" style="margin-top: 20px;">
                                <tr>
                                    <td style="height: 2px; background: linear-gradient(90deg, transparent, #00e5ff80, transparent);"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td align="center" valign="top" style="padding: 40px 30px 20px 30px;">
                            <!-- Welcome Header -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #ffffff; font-size: 24px; font-weight: bold; text-align: center; text-transform: uppercase; letter-spacing: 2px;">
                                        WELCOME TO NOTMONKEYTYPE
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0 0 0; color: #00e5ff; font-size: 14px; text-align: center; letter-spacing: 4px; text-transform: uppercase;">
                                        ACCOUNT VERIFICATION
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Welcome Message -->
                    <tr>
                        <td align="center" valign="top" style="padding: 0 30px 40px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #e0e0e0; font-size: 16px; line-height: 24px; text-align: center;">
                                        <p style="margin: 0 0 20px 0;">Hello ${firstName},</p>
                                        <p style="margin: 0 0 20px 0;">Your notMonkeyType account is ready for activation. Please use the verification code below to complete the setup process.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Verification Code Box -->
                    <tr>
                        <td align="center" valign="top" style="padding: 0 30px 40px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="80%" style="background-color: #151c28; border: 1px solid #00e5ff40; border-radius: 8px;">
                                <!-- Corner Decorations -->
                                <tr>
                                    <td align="left" valign="top" style="width: 15px; height: 15px; border-top: 2px solid #00e5ff; border-left: 2px solid #00e5ff;"></td>
                                    <td></td>
                                    <td align="right" valign="top" style="width: 15px; height: 15px; border-top: 2px solid #00e5ff; border-right: 2px solid #00e5ff;"></td>
                                </tr>
                                <!-- Code Title -->
                                <tr>
                                    <td colspan="3" style="padding: 15px 0 5px 0; text-align: center; color: #00e5ff; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">
                                        Verification Code
                                    </td>
                                </tr>
                                <!-- Actual Code -->
                                <tr>
                                    <td colspan="3" style="padding: 5px 20px 15px 20px; text-align: center; color: #ffffff; font-size: 32px; font-family: 'Courier New', monospace; letter-spacing: 6px; font-weight: bold;">
                                        ${verificationCode}
                                    </td>
                                </tr>
                                <!-- Expiration Notice -->
                                <tr>
                                    <td colspan="3" style="padding: 0 0 15px 0; text-align: center; color: #aaaaaa; font-size: 12px;">
                                        This code will expire in 3 minutes
                                    </td>
                                </tr>
                                <!-- Corner Decorations -->
                                <tr>
                                    <td align="left" valign="bottom" style="width: 15px; height: 15px; border-bottom: 2px solid #00e5ff; border-left: 2px solid #00e5ff;"></td>
                                    <td></td>
                                    <td align="right" valign="bottom" style="width: 15px; height: 15px; border-bottom: 2px solid #00e5ff; border-right: 2px solid #00e5ff;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Additional Message -->
                    <tr>
                        <td align="center" valign="top" style="padding: 0 30px 40px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #bbbbbb; font-size: 14px; line-height: 20px; text-align: center;">
                                        If you did not request this verification, please disregard this email.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" valign="top" style="padding: 20px 30px; background-color: #0a0e14; border-top: 1px solid #00e5ff20; border-radius: 0 0 8px 8px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <!-- Mini Logo -->
                                <tr>
                                    <td align="center" style="padding: 0 0 15px 0;">
                                        <img src="https://i.ibb.co/CpDC2cmp/nmt.png" alt="notMonkeyType Logo" width="100" style="display: block; border: 0;" />
                                    </td>
                                </tr>
                                <!-- Links -->
                                <tr>
                                    <td align="center" style="padding: 0 0 15px 0;">
                                        <a href="#" style="color: #888888; font-size: 12px; text-decoration: none; margin: 0 10px;">Terms</a>
                                        <span style="color: #444444;">|</span>
                                        <a href="#" style="color: #888888; font-size: 12px; text-decoration: none; margin: 0 10px;">Privacy</a>
                                        <span style="color: #444444;">|</span>
                                        <a href="#" style="color: #888888; font-size: 12px; text-decoration: none; margin: 0 10px;">Support</a>
                                    </td>
                                </tr>
                                <!-- Copyright -->
                                <tr>
                                    <td align="center" style="color: #666666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                                        &copy; 2024 notMonkeyType. All Rights Reserved.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        const mailOptions = {
            from: 'notMonkeytype@gmail.com',
            to: email,
            subject: 'Email Verification',
            html: emailBodyHTML
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

module.exports.sendVerificationEmail = sendVerificationEmail;
