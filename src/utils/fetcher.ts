const fetcher = <T = any>(resource: RequestInfo, init?: RequestInit): Promise<T> =>
  fetch(resource, init).then(async (response: Response) =>
    response.ok ? response.json() : Promise.reject(response.json?.())
  )

export default fetcher
