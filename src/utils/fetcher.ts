const fetcher = <T = any>(endpoint: string): Promise<T> =>
  fetch(endpoint).then((response: Response) =>
    // response.ok ? response.json() : undefined
    response.json()
  )

export default fetcher
