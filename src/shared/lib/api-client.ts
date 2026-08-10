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

async function throwApiError(res: Response): Promise<never> {
  const body = await res.json().catch(() => null);
  const err = body as ApiErrorEnvelope | null;
  const message = Array.isArray(err?.message)
    ? err.message.join(", ")
    : (err?.message ?? "Something went wrong. Please try again.");
  throw new ApiError(message, res.status, err?.errorCode ?? "UNKNOWN_ERROR");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) await throwApiError(res);

  const body = await res.json().catch(() => null);
  return (body as ApiEnvelope<T>).data;
}

async function requestForm<T>(
  path: string,
  method: "POST" | "PATCH",
  formData: FormData,
  token?: string | null,
): Promise<T> {
  // No Content-Type header here on purpose — fetch sets
  // multipart/form-data with the correct boundary automatically for a
  // FormData body; setting it manually breaks the boundary.
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) await throwApiError(res);

  const body = await res.json().catch(() => null);
  return (body as ApiEnvelope<T>).data;
}

export interface BlobResponse {
  blob: Blob;
  filename: string | null;
}

function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null;
  const match = /filename="?([^";]+)"?/i.exec(header);
  return match ? match[1] : null;
}

/**
 * Multipart upload — deliberately bypasses request()'s JSON Content-Type
 * header. Setting Content-Type manually for FormData is actually wrong: the
 * browser needs to generate it itself (it embeds a random multipart
 * boundary the server parses on), so this is its own small function rather
 * than a request() option.
 */
async function uploadFile<T>(
  path: string,
  formData: FormData,
  token?: string | null,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) await throwApiError(res);

  const body = await res.json().catch(() => null);
  return (body as ApiEnvelope<T>).data;
}

async function downloadBlob(
  path: string,
  token?: string | null,
): Promise<BlobResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  // The backend still returns a JSON error envelope on failure even when a
  // binary format was requested — this check must happen before res.blob(),
  // or a failed download silently saves a JSON error body as a .pdf/.xlsx.
  if (!res.ok) await throwApiError(res);

  const blob = await res.blob();
  const filename = parseContentDispositionFilename(
    res.headers.get("Content-Disposition"),
  );
  return { blob, filename };
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
  patch: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(
      path,
      { method: "PATCH", body: body ? JSON.stringify(body) : undefined },
      token,
    ),
  put: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(
      path,
      { method: "PUT", body: body ? JSON.stringify(body) : undefined },
      token,
    ),
  delete: <T>(path: string, token?: string | null) =>
    request<T>(path, { method: "DELETE" }, token),
  postForm: <T>(path: string, formData: FormData, token?: string | null) =>
    requestForm<T>(path, "POST", formData, token),
  downloadBlob,
  uploadFile,
};
