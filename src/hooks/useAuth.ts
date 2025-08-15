import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { loadAdminUser } from "@/store/slices/adminAuthSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading } = useAppSelector(
    (state) => state.adminAuth
  );

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      dispatch(loadAdminUser());
    }
  }, [dispatch, isAuthenticated, isLoading]);

  return {
    isAuthenticated,
    user,
    isLoading,
  };
}
