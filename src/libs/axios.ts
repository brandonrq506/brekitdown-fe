import axios from "axios";

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
