import axios from "axios";
import { type DefaultOptions, QueryClient } from "@tanstack/react-query";

const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status !== undefined && status >= 400 && status < 500 && status !== 408 && status !== 429) {
      return false;
    }
  }

  return failureCount < 3;
};

const options: DefaultOptions = {
  queries: {
    staleTime: 30_000,
    retry: shouldRetryQuery,
  },
};

export const createQueryClient = () => new QueryClient({ defaultOptions: options });
