import mongoose from "mongoose";
import User from "../model/user.model.js";

/**
 * Admin org = that admin + every user with managedBy === admin.
 * Project.user is the creator (admin or manager on the team); all such creators are in this set.
 */
export async function getOrgCreatorUserIds(orgAdminId) {
  if (!orgAdminId) return [];
  const adminObjId = mongoose.Types.ObjectId.isValid(orgAdminId)
    ? new mongoose.Types.ObjectId(orgAdminId)
    : orgAdminId;
  const team = await User.find({ managedBy: adminObjId }).select("_id").lean();
  return [adminObjId, ...team.map((u) => u._id)];
}

/** super-admin → null (global). admin → self. Others → their managing admin, if any. */
export function resolveOrgAdminId(reqUser) {
  const { role, _id, managedBy } = reqUser;
  if (role === "super-admin") return null;
  if (role === "admin") return _id;
  return managedBy || null;
}

export async function userBelongsToOrg(userId, orgAdminId) {
  if (!userId || !orgAdminId) return false;
  if (userId.toString() === orgAdminId.toString()) return true;
  const u = await User.findById(userId).select("managedBy").lean();
  return u?.managedBy?.toString() === orgAdminId.toString();
}

export async function canAccessUserProfile(actor, targetUserId) {
  if (actor.role === "super-admin") return true;
  const target = await User.findById(targetUserId).select("managedBy").lean();
  if (!target) return false;
  const tid = target._id.toString();
  if (tid === actor._id.toString()) return true;

  if (actor.role === "admin") {
    return (
      target.managedBy?.toString() === actor._id.toString() ||
      tid === actor._id.toString()
    );
  }

  const orgAdminId = resolveOrgAdminId(actor);
  if (!orgAdminId) return false;
  if (tid === orgAdminId.toString()) return true;
  return target.managedBy?.toString() === orgAdminId.toString();
}
