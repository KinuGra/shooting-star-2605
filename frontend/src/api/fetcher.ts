import { getAuthToken } from "@/lib/auth-client";

const BASE_URL =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8080`
    : "http://localhost:8080";

export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...options?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};
