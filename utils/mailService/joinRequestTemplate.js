const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const joinRequestTemplate = ({
  adminName = "Admin",
  userName = "A user",
  userEmail = "",
  orgName = "your organization",
  message = "",
  frontendUrl = "",
  appName = "Task Management System",
}) => {
  const safeAdmin = escapeHtml(adminName);
  const safeUser = escapeHtml(userName);
  const safeEmail = escapeHtml(userEmail);
  const safeOrg = escapeHtml(orgName);
  const safeMessage = escapeHtml(message);
  const safeUrl = escapeHtml(`${frontendUrl}/organization`);
  const safeApp = escapeHtml(appName);

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Join Request</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <tr>
              <td style="background:#111827;color:#ffffff;padding:20px 24px;">
                <h1 style="margin:0;font-size:20px;line-height:28px;">New Join Request</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px;font-size:14px;line-height:22px;">Hi ${safeAdmin},</p>
                <p style="margin:0 0 16px;font-size:14px;line-height:22px;">
                  <strong>${safeUser}</strong> (${safeEmail}) has requested to join <strong>${safeOrg}</strong>.
                </p>
                ${
                  safeMessage
                    ? `<p style="margin:0 0 16px;font-size:14px;line-height:22px;padding:12px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;">
                        <em>"${safeMessage}"</em>
                      </p>`
                    : ""
                }
                <p style="margin:0 0 20px;font-size:14px;line-height:22px;">
                  Go to your organization page to accept or decline this request:
                </p>
                ${
                  frontendUrl
                    ? `<p style="margin:0 0 18px;">
                        <a href="${safeUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:10px 20px;border-radius:6px;">
                          View Join Requests
                        </a>
                      </p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px;line-height:18px;">
                ${safeApp} &bull; You received this because you are the admin of ${safeOrg}.
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
