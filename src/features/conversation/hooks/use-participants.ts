import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ParticipantId } from "../../../../convex/types/convexTypes";

export const useGetParticipants = () => {
  return useQuery(api.db.participants.getAll);
};

export const useGetParticipantById = (id: ParticipantId | null) => {
  return useQuery(api.db.participants.getById, id ? { id } : "skip");
};

export const useGetParticipantByExternalId = (externalId: string | null) => {
  return useQuery(
    api.db.participants.getByExternalId,
    externalId ? { externalId } : "skip",
  );
};

export const useCreateParticipant = () => {
  return useMutation(api.db.participants.create);
};

export const useUpdateParticipantStatus = () => {
  return useMutation(api.db.participants.updateStatus);
};

export const useUpsertParticipant = () => {
  return useMutation(api.db.participants.upsert);
};

export const useRemoveParticipant = () => {
  return useMutation(api.db.participants.remove);
};
