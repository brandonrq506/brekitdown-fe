import axios from "axios";

export type ApiValidationErrors = Record<string, string[]>;

interface ApiValidationErrorResponse {
  errors: ApiValidationErrors;
}

const isApiValidationErrors = (value: unknown): value is ApiValidationErrors => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

  return Object.values(value).every(
    (messages) =>
      Array.isArray(messages) && messages.every((message) => typeof message === "string"),
  );
};

export const getApiValidationErrors = (error: unknown): ApiValidationErrors | null => {
  if (!axios.isAxiosError<ApiValidationErrorResponse>(error) || error.response?.status !== 422) {
    return null;
  }

  const errors = error.response.data?.errors;
  return isApiValidationErrors(errors) ? errors : null;
};

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN = import.meta.env.VITE_DEV_TOKEN;

if (!API_URL) throw new Error("VITE_API_URL is not defined in the env variables.");

if (!TOKEN) throw new Error("VITE_DEV_TOKEN is not defined in the env variables.");

export const api = axios.create({
  baseURL: API_URL,
  timeout: 5_000,
  transitional: {
    clarifyTimeoutError: true,
  },
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
});

export const GOALS_ENDPOINT = "/goals";
