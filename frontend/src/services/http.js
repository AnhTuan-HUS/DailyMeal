import { API_BASE_URL } from '@/config/env'

/** Wrapper fetch dung chung: tu them base URL, parse JSON, nem loi co y nghia. */
export async function http(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(API_BASE_URL + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = new Error('API ' + res.status + ' ' + res.statusText)
    err.status = res.status
    throw err
  }
  return res.status === 204 ? null : res.json()
}