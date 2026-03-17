import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { AgentId } from "../../../../../convex/types/convexTypes";

export const useCreateAgent = () => {
  return useMutation(api.agents.create);
};

export const useGetAgents = () => {
  return useQuery(api.agents.getAll);
};

export const useGetAgentById = (id: AgentId | null) => {
  return useQuery(api.agents.getById, id ? { id } : "skip");
};

export const useUpdateAgent = () => {
  return useMutation(api.agents.update);
};
