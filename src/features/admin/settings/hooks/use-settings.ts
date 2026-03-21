import { api } from "../../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

export const useGetSetting = (key: string) => {
  return useQuery(api.db.settings.getSetting, { key });
};

export const useUpdateSetting = () => {
  return useMutation(api.db.settings.updateSetting);
};
