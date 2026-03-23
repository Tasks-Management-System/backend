const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const verifyEmailTemplate = ({
  name = "there",
  verifyUrl = "",
  expiryMinutes = 10,
  appName = "Task Management System",
  supportEmail = "",
}) => {
  const safeName = escapeHtml(name);
  const safeVerifyUrl = escapeHtml(verifyUrl);
  const safeExpiry = escapeHtml(expiryMinutes);
  const safeAppName = escapeHtml(appName);
  const safeSupportEmail = escapeHtml(supportEmail);

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <tr>
              <td style="background:#111827;color:#ffffff;padding:20px 24px;">
                <h1 style="margin:0;font-size:20px;line-height:28px;">Verify Your Email</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px;font-size:14px;line-height:22px;">Hi ${safeName},</p>
                <p style="margin:0 0 16px;font-size:14px;line-height:22px;">
                  Please confirm your email address by clicking the button below.
                </p>

                ${
                  verifyUrl
                    ? `<p style="margin:0 0 18px;">
                        <a href="${safeVerifyUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:10px 16px;border-radius:6px;">
                          Verify Email
                        </a>
                      </p>`
                    : ""
                }

                <p style="margin:0;font-size:13px;line-height:20px;color:#374151;">
                  This verification link expires in <strong>${safeExpiry} minutes</strong>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px;line-height:18px;">
                ${safeAppName} • If you did not request this, please ignore this email.
                ${supportEmail ? `<br />Support: ${safeSupportEmail}` : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
