const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(`${BASE_URL}${url}`, options);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
};
