import http from '../utils/https'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export function auth<T = any>(
  url: string,
  data?: Record<string, any>,
  method: 'GET' | 'POST' = 'POST'
): Promise<AxiosResponse<T>> {
  const config: AxiosRequestConfig = {
    baseURL: 'https://api.medcontact.kz/',
    url: `auth/api/v1/auth/${url}`,
    method,
  }

  if (method === 'POST') {
    config.data = data
  } else {
    config.params = data
  }

  return http(config)
}
