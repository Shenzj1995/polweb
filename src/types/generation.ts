export type GenerationType =
  | "TEXT_TO_VIDEO"
  | "IMAGE_TO_VIDEO"
  | "VIDEO_TO_VIDEO"
  | "TEXT_TO_IMAGE"
  | "IMAGE_TO_IMAGE"
  | "AVATAR_VIDEO";

export type GenStatus = "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "CANCELLED";

export type Plan = "FREE" | "STARTER" | "PRO";
