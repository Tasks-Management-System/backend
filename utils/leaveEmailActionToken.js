import jwt from "jsonwebtoken";

const TYP = "leave_email_action";

function secret() {
  return (
    process.env.LEAVE_EMAIL_JWT_SECRET ||
    process.env.JWT_SECRET ||
    "change-me-leave-email"
  );
}

/**
 * @param {string} leaveId Mongo _id string
 * @param {"approve"|"reject"} action
 */
export function signLeaveEmailActionToken(leaveId, action) {
  return jwt.sign(
    { typ: TYP, lid: String(leaveId), act: action },
    secret(),
    { expiresIn: process.env.LEAVE_EMAIL_TOKEN_EXPIRES || "14d" }
  );
}

/**
 * @returns {{ lid: string, act: "approve"|"reject" }}
 */
export function verifyLeaveEmailActionToken(token) {
  const payload = jwt.verify(token, secret());
  if (payload.typ !== TYP || !payload.lid || !payload.act) {
    throw new Error("Invalid token payload");
  }
  if (payload.act !== "approve" && payload.act !== "reject") {
    throw new Error("Invalid action");
  }
  return { lid: payload.lid, act: payload.act };
}
