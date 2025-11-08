export const leaveStatusTemplate = ({ employeeName, status, leaveType, fromDate, toDate }) => `
  <h2>Your Leave Request Update</h2>
  <p>Hi ${employeeName},</p>
  <p>Your <strong>${leaveType}</strong> leave from <strong>${fromDate}</strong> to <strong>${toDate}</strong> has been <strong>${status}</strong>.</p>
  <p>Thank you,</p>
  <p>HR Department</p>
`;
