import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useGetTopics = () => {
  return useQuery(api.topics.getAll);
};

export const useGetActiveTopics = () => {
  return useQuery(api.topics.getActive);
};

export const useGetTopicById = (id: Id<"topics"> | null) => {
  return useQuery(api.topics.getById, id ? { id } : "skip");
};

export const useCreateTopic = () => {
  return useMutation(api.topics.create);
};

export const useUpdateTopic = () => {
  return useMutation(api.topics.update);
};

export const useRemoveTopic = () => {
  return useMutation(api.topics.remove);
};
