import axios from "axios";
import { type DefaultOptions, QueryClient } from "@tanstack/react-query";
import { HTTP_STATUS, HTTP_STATUS_RANGE } from "@/constants/http";

const MAX_QUERY_RETRIES = 3;

const RETRYABLE_CLIENT_ERRORS: number[] = [
  HTTP_STATUS.REQUEST_TIMEOUT,
  HTTP_STATUS.TOO_MANY_REQUESTS,
];

const isClientError = (status: number) =>
  status >= HTTP_STATUS_RANGE.CLIENT_ERROR_START && status < HTTP_STATUS_RANGE.SERVER_ERROR_START;

const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (
      status !== undefined &&
      isClientError(status) &&
      !RETRYABLE_CLIENT_ERRORS.includes(status)
    ) {
      return false;
    }
  }

  return failureCount < MAX_QUERY_RETRIES;
};

const options: DefaultOptions = {
  queries: {
    staleTime: 30_000,
    retry: shouldRetryQuery,
  },
};

export const createQueryClient = () => new QueryClient({ defaultOptions: options });
