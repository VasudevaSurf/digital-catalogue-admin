import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchOrders } from "@/store/slices/adminOrderSlice";

export function useOrders(options?: {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}) {
  const dispatch = useAppDispatch();
  const { orders, isLoading, error, pagination } = useAppSelector(
    (state) => state.adminOrders
  );

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (options?.autoFetch !== false && !hasLoaded) {
      dispatch(
        fetchOrders({
          page: options?.page || 1,
          limit: options?.limit || 10,
        })
      );
      setHasLoaded(true);
    }
  }, [dispatch, options, hasLoaded]);

  const refreshOrders = () => {
    dispatch(
      fetchOrders({
        page: pagination.page,
        limit: pagination.limit,
      })
    );
  };

  return {
    orders,
    isLoading,
    error,
    pagination,
    refreshOrders,
  };
}
