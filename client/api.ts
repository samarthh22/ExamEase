import { useEffect, useState } from "react";
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Cannot reach the server. Check your connection and try again.",
    );
  }
  const result = await response.json().catch(() => null);
  if (!result)
    throw new Error(
      "The server did not return a valid response. Please try again.",
    );
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth"))
      window.dispatchEvent(new Event("session-expired"));
    throw new Error(result.message || "The request could not be completed.");
  }
  return result as T;
}
export function useData<T>(path: string, version = 0) {
  const [data, setData] = useState<T | null>(null),
    [dataPath, setDataPath] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      setError("");
      return;
    }
    let live = true;
    setLoading(true);
    setError("");
    api<T>(path)
      .then((value) => {
        if (live) {
          setData(value);
          setDataPath(path);
        }
      })
      .catch((e) => {
        if (live) {
          setError(e.message);
          setData(null);
        }
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [path, version]);
  return { data: dataPath === path ? data : null, error, loading };
}
