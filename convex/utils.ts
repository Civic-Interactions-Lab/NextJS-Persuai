export const isValidConvexId = (id: string): boolean => {
  return /^[a-z0-9]{20,}$/.test(id);
};
