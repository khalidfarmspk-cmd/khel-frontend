const BASE_URL = import.meta.env.VITE_API_URL

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

async function readError(response, fallback) {
  try {
    const data = await response.json()
    const message = data.message || data.error || fallback
    const err = new Error(message)
    err.status = response.status
    return err
  } catch {
    const err = new Error(fallback)
    err.status = response.status
    return err
  }
}

export async function apiRequest(
  path,
  { method = 'GET', body, token, handle401 = true } = {},
) {
  const headers = {}
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    })
  } catch {
    throw new Error('Unable to reach the server')
  }

  if (response.status === 401) {
    if (handle401) {
      unauthorizedHandler?.()
    }
    throw await readError(response, 'Unauthorized')
  }

  if (!response.ok) {
    throw await readError(response, 'Request failed')
  }

  const text = await response.text()
  return text ? JSON.parse(text) : null
}
