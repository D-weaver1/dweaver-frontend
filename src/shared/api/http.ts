import {
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
} from "../lib/authStorage";

const API_URL = import.meta.env.VITE_API_URL;

async function parseResponse(response: Response) {
  if (response.status === 204) {
    return undefined;
  }

  return response.json().catch(() => null);
}

async function refreshAccessToken() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    removeAccessToken();
    return null;
  }

  const data = await parseResponse(response);

  if (!data?.accessToken) {
    removeAccessToken();
    return null;
  }

  saveAccessToken(data.accessToken);

  return data.accessToken as string;
}

export async function http<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
  raw = false,
): Promise<T> {
  const headers = new Headers(options.headers);

  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retry && path !== "/auth/refresh") {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      return http<T>(path, options, false);
    }
  }

  if (!response.ok) {
    const errorData = await parseResponse(response);

    throw new Error(
      errorData?.message || `Request failed with status ${response.status}`,
    );
  }

  if (raw) {
    return response as unknown as T;
  }

  return parseResponse(response) as Promise<T>;
}

export async function httpBlob(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<Blob> {
  const headers = new Headers(options.headers);

  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retry && path !== "/auth/refresh") {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      return httpBlob(path, options, false);
    }
  }

  if (!response.ok) {
    const errorData = await parseResponse(response);

    throw new Error(
      errorData?.message || `Request failed with status ${response.status}`,
    );
  }

  return response.blob();
}
