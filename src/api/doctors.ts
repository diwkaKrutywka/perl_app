import type { AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import http from '../utils/https'

export function DoctorsApi<T = any>(
    url: string,
    data?: Record<string, any>,
    method: Method = 'POST'
  ): Promise<AxiosResponse<T>> {
    const config: AxiosRequestConfig = {
      url: `doctor${url}/`,
      method,
    }
  
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = data
    } else if (method.toUpperCase() === 'GET') {
      config.params = data
    }
  
    return http(config)
  }

// Типы для врачей
export interface Doctor {
  id: string;
  clinic_id: string;
  full_name: string;
  category_degree?: string | null;
  experience_years?: number | null;
  education?: string;
  cabinet: string;
  area?: string;
  house_calls?: boolean;
  phone?: string | null;
  notes?: string;
  is_active: boolean;
  created_date: string;
  updated_date: string;
  clinic_info?: {
    id: string;
    name: string;
    address: string;
    is_active: boolean;
  };
  specialties?: Array<{
    id: string;
    doctor_id: string;
    clinic_specialty_id: string;
    is_active: boolean;
    created_date: string;
    updated_date: string;
    specialty: {
      id: string;
      name: string;
      name_kz?: string | null;
      description: string;
      description_kz?: string | null;
      damu_hPost_id?: number;
      is_active: boolean;
      created_at?: string | null;
      updated_at?: string | null;
    };
  }>;
  services?: Array<{
    id: string;
    doctor_id: string;
    clinic_id: string;
    service_price?: string | null;
    is_active: boolean;
    created_date: string;
    updated_date: string;
    clinic_service: {
      id: string;
      clinic_id: string;
      clinic_price: string;
      clinic_duration_minutes?: number | null;
      available_for_adults: boolean;
      available_for_children: boolean;
      covered_by_oms: boolean;
      installment_available: boolean;
      house_calls_available: boolean;
      damu_price_list_service_id?: number | null;
      damu_price_list_services_public_code?: string | null;
      clinic_notes?: string;
      is_available: boolean;
      service: {
        id: string;
        category_id?: string | null;
        name: string;
        name_kz?: string;
        description?: string;
        damu_typical_tarificator_id?: number;
        damu_price_list_service_id?: number;
        damu_price_list_services_public_code?: string;
        description_kz?: string;
        is_active: boolean;
        created_at?: string | null;
        updated_at?: string | null;
      };
    };
  }>;
  departments?: Array<{
    id: string;
    doctor_id: string;
    department_id: string;
    clinic_id: string;
    is_active: boolean;
    created_date: string;
    updated_date: string;
    department: {
      id: string;
      clinic_id: string;
      description: string;
      description_kz: string;
      phone_number?: string | null;
      is_active: boolean;
      created_date: string;
      updated_date: string;
      shared_department: {
        id: string;
        name: string;
        name_kz?: string | null;
        description: string;
        description_kz: string;
        is_active: boolean;
        created_date: string;
        updated_date: string;
      };
    };
  }>;
  schedules?: any[];
  damu_post_id?: number;
  // Дополнительные поля для совместимости
  doctor_id: string;
  specialty: string;
  schedule_string: string;
  type: 'oms' | 'paid';
  post_id?: number;
  org_healthcare_id?: string;
  price_list_service_id?: number;
}

export interface DoctorsResponse {
  doctors: Doctor[];
  specialityName?: string;
  total?: number;
}