export const leaveRequestTemplate = ({ employeeName, leaveType, fromDate, toDate, reason }) => `
  <h2>New Leave Request</h2>
  <p><strong>Employee:</strong> ${employeeName}</p>
  <p><strong>Leave Type:</strong> ${leaveType}</p>
  <p><strong>From:</strong> ${fromDate}</p>
  <p><strong>To:</strong> ${toDate}</p>
  <p><strong>Reason:</strong> ${reason}</p>
  <p>Please log in to the HR portal to approve or reject this leave.</p>
`;
