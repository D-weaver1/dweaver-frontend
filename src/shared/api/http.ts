import {
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
} from "../../features/auth/model/authStorage";

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
