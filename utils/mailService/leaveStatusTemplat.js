const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const leaveStatusTemplate = ({
  employeeName,
  status,
  leaveType,
  fromDate,
  toDate,
  note = "",
  appName = "Task Management System",
}) => {
  const normalizedStatus = (status || "").toString().toLowerCase();
  const isApproved = normalizedStatus === "approved";
  const isRejected = normalizedStatus === "rejected";
  const badgeColor = isApproved ? "#065f46" : isRejected ? "#991b1b" : "#1f2937";
  const badgeBg = isApproved ? "#d1fae5" : isRejected ? "#fee2e2" : "#e5e7eb";

  const safeEmployeeName = escapeHtml(employeeName || "Employee");
  const safeStatus = escapeHtml(status || "updated");
  const safeLeaveType = escapeHtml(leaveType || "N/A");
  const safeFromDate = escapeHtml(fromDate || "N/A");
  const safeToDate = escapeHtml(toDate || "N/A");
  const safeNote = escapeHtml(note);
  const safeAppName = escapeHtml(appName);

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Leave Request Update</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <tr>
              <td style="background:#111827;color:#ffffff;padding:20px 24px;">
                <h1 style="margin:0;font-size:20px;line-height:28px;">Leave Request Status</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 8px;font-size:14px;line-height:22px;">Hi ${safeEmployeeName},</p>
                <p style="margin:0 0 16px;font-size:14px;line-height:22px;">
                  Your leave request has been updated.
                </p>
                <p style="margin:0 0 18px;">
                  <span style="display:inline-block;padding:6px 10px;border-radius:999px;background:${badgeBg};color:${badgeColor};font-size:12px;font-weight:700;text-transform:uppercase;">
                    ${safeStatus}
                  </span>
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;font-size:13px;font-weight:700;">Leave Type</td>
                    <td style="padding:10px;border:1px solid #e5e7eb;font-size:13px;">${safeLeaveType}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;font-size:13px;font-weight:700;">From</td>
                    <td style="padding:10px;border:1px solid #e5e7eb;font-size:13px;">${safeFromDate}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;font-size:13px;font-weight:700;">To</td>
                    <td style="padding:10px;border:1px solid #e5e7eb;font-size:13px;">${safeToDate}</td>
                  </tr>
                  ${
                    note
                      ? `<tr>
                          <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;font-size:13px;font-weight:700;vertical-align:top;">Note</td>
                          <td style="padding:10px;border:1px solid #e5e7eb;font-size:13px;white-space:pre-wrap;">${safeNote}</td>
                        </tr>`
                      : ""
                  }
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px;line-height:18px;">
                ${safeAppName} • Please do not reply to this automated email.
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
