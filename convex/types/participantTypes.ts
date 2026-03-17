import { v } from "convex/values";

export const PARTICIPANT_STATUSES = [
  "pending",
  "active",
  "completed",
  "opted_out",
  "partial",
] as const;

export type ParticipantStatus = (typeof PARTICIPANT_STATUSES)[number];

export const participantStatusValidator = v.union(
  ...(PARTICIPANT_STATUSES.map((s) => v.literal(s)) as [
    ReturnType<typeof v.literal>,
    ReturnType<typeof v.literal>,
    ...ReturnType<typeof v.literal>[],
  ]),
);

export const PARTICIPANT_STATUS_LABELS: Record<ParticipantStatus, string> = {
  pending: "Pending",
  active: "Active",
  completed: "Completed",
  opted_out: "Opted Out",
  partial: "Partial",
};

export const PARTICIPANT_STATUS_DESCRIPTIONS: Record<
  ParticipantStatus,
  string
> = {
  pending: "Registered but hasn't started yet",
  active: "Currently in the debating process",
  completed: "Went through the full study",
  opted_out: "Exited during pre-survey before conversation",
  partial: "Left early during conversation (under 15 rounds)",
};
