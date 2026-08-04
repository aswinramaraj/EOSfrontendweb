const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  errorCode: string;
  message: string | string[];
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const method = options.method ?? "GET";

  // eslint-disable-next-line no-console
  console.log("[apiClient] request", {
    url,
    method,
    body: options.body ?? null,
  });

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const rawText = await res.text();
  let body: unknown = null;
  try {
    body = rawText ? JSON.parse(rawText) : null;
  } catch {
    body = null;
  }

  // eslint-disable-next-line no-console
  console.log("[apiClient] response", {
    url,
    method,
    status: res.status,
    body: body ?? rawText,
  });

  if (!res.ok) {
    const err = body as ApiErrorEnvelope | null;
    let message: string;
    if (Array.isArray(err?.message)) {
      message = err.message.join(", ");
    } else if (err?.message) {
      message = err.message;
    } else if (rawText) {
      message = `[${res.status}] ${rawText}`;
    } else {
      message = `Request failed with status ${res.status} and no response body.`;
    }
    throw new ApiError(message, res.status, err?.errorCode ?? "UNKNOWN_ERROR");
  }

  return body ? (body as ApiEnvelope<T>).data : (undefined as T);
}

export const apiClient = {
  get: <T>(path: string, token?: string | null) =>
    request<T>(path, { method: "GET" }, token),
  post: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(
      path,
      { method: "POST", body: body ? JSON.stringify(body) : undefined },
      token,
    ),
  put: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(
      path,
      { method: "PUT", body: body ? JSON.stringify(body) : undefined },
      token,
    ),
  patch: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(
      path,
      { method: "PATCH", body: body ? JSON.stringify(body) : undefined },
      token,
    ),
  delete: <T>(path: string, token?: string | null) =>
    request<T>(path, { method: "DELETE" }, token),
};
