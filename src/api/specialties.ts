import type { AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import http from '../utils/https'


export function SpecialtiesApi<T = any>(
    url: string,
    data?: Record<string, any>,
    method: Method = 'POST'
  ): Promise<AxiosResponse<T>> {
    const config: AxiosRequestConfig = {
      url: `clinic-specialty/by-clinic/${url}`,
      method,
    }
  
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = data
    } else if (method.toUpperCase() === 'GET') {
      config.params = data
    }
  
    return http(config)
  }

// Типы для специальностей
export interface Specialty {
  id: string;
  name: string;
  description?: string;
}

export interface SpecialtiesResponse {
  clinic_specialties: Specialty[];
  total_count?: number;
}
  