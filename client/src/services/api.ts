export async function apiGet<T = any>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json() as Promise<T>;
}

export async function apiPost<T = any>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

export async function apiPut<T = any>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { method: "DELETE" });
  return res.json() as Promise<T>;
}
