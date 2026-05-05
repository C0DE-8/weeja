/**
 * @param {{ verificationUrl: string; expiresMinutes?: number }} params
 * @returns {{ subject: string; text: string; html: string }}
 */
function verificationLinkTemplate({ verificationUrl, expiresMinutes = 15 }) {
  const subject = "Verify your Weeja email";
  const text = [
    "Welcome to Weeja.",
    `Verify your email by opening this link: ${verificationUrl}`,
    `This link expires in ${expiresMinutes} minutes.`,
    "If you did not create an account, you can ignore this email.",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:20px;background:#111111;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:430px;background:#ffffff;border-radius:8px;box-shadow:0 8px 25px rgba(255,255,255,0.18);overflow:hidden;">
          <tr>
            <td style="padding:72px 28px 55px;text-align:center;">
              <div style="width:82px;height:56px;background:#f000d4;border-radius:8px;margin:0 auto 42px;position:relative;overflow:hidden;">
                <div style="position:absolute;top:10px;left:-4px;width:54px;height:8px;background:#ffffff;border-radius:20px;transform:rotate(38deg);transform-origin:center;"></div>
                <div style="position:absolute;top:10px;right:-4px;width:54px;height:8px;background:#ffffff;border-radius:20px;transform:rotate(-38deg);transform-origin:center;"></div>
              </div>
              <h1 style="margin:0 0 24px;font-size:27px;line-height:1.25;font-weight:800;color:#111111;letter-spacing:0.3px;">Verify Email Address</h1>
              <p style="margin:0 0 36px;font-size:18px;line-height:1.55;color:#555555;">
                A link has been sent to your mail, please follow the link to verify your email address.
              </p>
              <a href="${verificationUrl}" style="display:inline-block;width:100%;max-width:320px;background:#ff9800;color:#ffffff;text-decoration:none;font-size:20px;font-weight:700;padding:18px 20px;border-radius:999px;">
                Verify Email
              </a>
              <p style="margin:22px 0 0;font-size:13px;line-height:1.5;color:#666666;">
                This link expires in ${expiresMinutes} minutes. If you did not request it, you can ignore this email.
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

module.exports = { verificationLinkTemplate };
