import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { TopicId } from "../../../../convex/types/convexTypes";

export const useGetTopics = () => {
  return useQuery(api.topics.getAll);
};

export const useGetTopicById = (id: TopicId | null) => {
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
