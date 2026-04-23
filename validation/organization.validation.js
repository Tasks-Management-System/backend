import { z, registry } from "../swagger/registry.js";

export const CreateOrganizationBodySchema = z
  .object({
    name: z
      .string()
      .min(1, "Organization name is required")
      .openapi({ example: "Acme Corp" }),
  })
  .openapi("CreateOrganizationBody");

export const SendInviteBodySchema = z
  .object({
    userId: z
      .string()
      .min(1, "User ID is required")
      .openapi({ example: "64b1f2c3d4e5f6a7b8c9d0e1" }),
  })
  .openapi("SendInviteBody");

export const InviteIdParamSchema = z
  .object({
    id: z.string().min(1, "Invite ID is required"),
  })
  .openapi("InviteIdParam");

export const OrgMemberParamSchema = z
  .object({
    orgId: z.string().min(1, "Organization ID is required"),
    userId: z.string().min(1, "User ID is required"),
  })
  .openapi("OrgMemberParam");

export const SendJoinRequestBodySchema = z
  .object({
    organizationId: z
      .string()
      .min(1, "Organization ID is required")
      .openapi({ example: "64b1f2c3d4e5f6a7b8c9d0e1" }),
    message: z
      .string()
      .max(500, "Message must be under 500 characters")
      .optional()
      .openapi({ example: "I'd like to join your team" }),
  })
  .openapi("SendJoinRequestBody");

export const JoinRequestIdParamSchema = z
  .object({
    id: z.string().min(1, "Join request ID is required"),
  })
  .openapi("JoinRequestIdParam");

const bearerAuth = [{ bearerAuth: [] }];

registry.registerPath({
  method: "post",
  path: "/organization",
  tags: ["Organization"],
  summary: "Create an organization (admin only)",
  security: bearerAuth,
  request: {
    body: {
      content: { "application/json": { schema: CreateOrganizationBodySchema } },
    },
  },
  responses: {
    201: { description: "Organization created" },
    400: { description: "Already has an organization" },
    403: { description: "Forbidden" },
  },
});

registry.registerPath({
  method: "get",
  path: "/organization/my",
  tags: ["Organization"],
  summary: "Get the organization the current user belongs to",
  security: bearerAuth,
  responses: {
    200: { description: "Organization details" },
    404: { description: "Not part of any organization" },
  },
});

registry.registerPath({
  method: "post",
  path: "/organization/invite",
  tags: ["Organization"],
  summary: "Send an invitation to a user (admin only)",
  security: bearerAuth,
  request: {
    body: {
      content: { "application/json": { schema: SendInviteBodySchema } },
    },
  },
  responses: {
    201: { description: "Invitation sent" },
    400: { description: "Already a member or invite exists" },
    403: { description: "Forbidden" },
    404: { description: "User or organization not found" },
  },
});

registry.registerPath({
  method: "get",
  path: "/organization/invites",
  tags: ["Organization"],
  summary: "Get all invites sent by the admin",
  security: bearerAuth,
  responses: {
    200: { description: "List of invites" },
    403: { description: "Forbidden" },
  },
});

registry.registerPath({
  method: "get",
  path: "/organization/invites/my",
  tags: ["Organization"],
  summary: "Get pending invites for the current user",
  security: bearerAuth,
  responses: {
    200: { description: "List of pending invites" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/organization/invites/{id}/accept",
  tags: ["Organization"],
  summary: "Accept an organization invite",
  security: bearerAuth,
  request: { params: InviteIdParamSchema },
  responses: {
    200: { description: "Joined the organization" },
    404: { description: "Invite not found" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/organization/invites/{id}/reject",
  tags: ["Organization"],
  summary: "Reject an organization invite",
  security: bearerAuth,
  request: { params: InviteIdParamSchema },
  responses: {
    200: { description: "Invite rejected" },
    404: { description: "Invite not found" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/organization/{orgId}/members/{userId}",
  tags: ["Organization"],
  summary: "Remove a member from the organization (admin only)",
  security: bearerAuth,
  request: { params: OrgMemberParamSchema },
  responses: {
    200: { description: "Member removed" },
    403: { description: "Forbidden" },
  },
});

registry.registerPath({
  method: "get",
  path: "/organization/all",
  tags: ["Organization"],
  summary: "List all organizations",
  security: bearerAuth,
  responses: {
    200: { description: "List of organizations" },
  },
});

registry.registerPath({
  method: "post",
  path: "/organization/join-request",
  tags: ["Organization"],
  summary: "Send a join request to an organization",
  security: bearerAuth,
  request: {
    body: {
      content: { "application/json": { schema: SendJoinRequestBodySchema } },
    },
  },
  responses: {
    201: { description: "Join request sent" },
    400: { description: "Already a member or request exists" },
    404: { description: "Organization not found" },
  },
});

registry.registerPath({
  method: "get",
  path: "/organization/join-requests",
  tags: ["Organization"],
  summary: "Get join requests for admin's organization",
  security: bearerAuth,
  responses: {
    200: { description: "List of join requests" },
    403: { description: "Forbidden" },
  },
});

registry.registerPath({
  method: "get",
  path: "/organization/join-requests/my",
  tags: ["Organization"],
  summary: "Get current user's join requests",
  security: bearerAuth,
  responses: {
    200: { description: "List of user's join requests" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/organization/join-requests/{id}/accept",
  tags: ["Organization"],
  summary: "Accept a join request (admin only)",
  security: bearerAuth,
  request: { params: JoinRequestIdParamSchema },
  responses: {
    200: { description: "Join request accepted" },
    403: { description: "Forbidden" },
    404: { description: "Join request not found" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/organization/join-requests/{id}/reject",
  tags: ["Organization"],
  summary: "Reject a join request (admin only)",
  security: bearerAuth,
  request: { params: JoinRequestIdParamSchema },
  responses: {
    200: { description: "Join request rejected" },
    403: { description: "Forbidden" },
    404: { description: "Join request not found" },
  },
});
