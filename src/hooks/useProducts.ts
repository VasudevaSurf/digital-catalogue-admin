import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchProducts } from "@/store/slices/adminProductSlice";

export function useProducts(options?: {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}) {
  const dispatch = useAppDispatch();
  const { products, isLoading, error, pagination } = useAppSelector(
    (state) => state.adminProducts
  );

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (options?.autoFetch !== false && !hasLoaded) {
      dispatch(
        fetchProducts({
          page: options?.page || 1,
          limit: options?.limit || 10,
        })
      );
      setHasLoaded(true);
    }
  }, [dispatch, options, hasLoaded]);

  const refreshProducts = () => {
    dispatch(
      fetchProducts({
        page: pagination.page,
        limit: pagination.limit,
      })
    );
  };

  return {
    products,
    isLoading,
    error,
    pagination,
    refreshProducts,
  };
}
