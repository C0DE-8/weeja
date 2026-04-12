/**
 * Verification OTP email — edit `html` here to change layout and styling.
 * @param {{ otp: string; expiresMinutes?: number }} params
 * @returns {{ subject: string; text: string; html: string }}
 */
function verificationOtpTemplate({ otp, expiresMinutes = 15 }) {
  const subject = "Your verification code";
  const text = `Your verification code is ${otp}. It expires in ${expiresMinutes} minutes.`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background-color:#f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:28px 24px 8px;">
              <p style="margin:0;font-size:16px;color:#18181b;">Verify your email</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 24px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#3f3f46;">
                Use this code to complete your registration:
              </p>
              <p style="margin:0 0 20px;font-size:28px;font-weight:600;letter-spacing:0.2em;color:#18181b;text-align:center;">
                ${otp}
              </p>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#71717a;">
                This code expires in ${expiresMinutes} minutes. If you did not request it, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { subject, text, html };
}

module.exports = { verificationOtpTemplate };
