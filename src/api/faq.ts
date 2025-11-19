import http from '../utils/https'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export interface FAQItem {
  id: string
  clinic_id: string
  question: string
  question_kz?: string
  answer: string
  answer_kz?: string
  category?: string
  category_kz?: string
  is_frequently_asked?: boolean
  is_active?: boolean
  created_date?: string
  updated_date?: string
}

export interface FAQResponse {
  success: boolean
  key: string
  code: number
  message: string
  data: {
    faqs: FAQItem[]
    pagination: {
      page: number
      page_size: number
      total_count: number
      total_pages: number
      has_next: boolean
      has_previous: boolean
    }
  }
}

export function FaqApi<T = any>(
  _url: string,
  data?: Record<string, any>,
  method: 'GET' | 'POST' = 'GET'
): Promise<AxiosResponse<T>> {
  console.log('FaqApi called with method:', method, 'url:', `faq/by-clinic/4397b3cd-60e2-419f-a146-a060d0b58f0c/`)
  const config: AxiosRequestConfig = {
    url: `faq/by-clinic/4397b3cd-60e2-419f-a146-a060d0b58f0c/`,
    method
  }

  if (method === 'POST') {
    config.data = data
  } else {
    config.params = data
  }

  return http(config)
}

// Helper function to get FAQ with language-based questions
export async function getFaqByLanguage(language: string = 'ru'): Promise<FAQItem[]> {
  try {
    console.log('Fetching FAQ with language:', language)
    const response = await FaqApi<FAQResponse>('', {}, 'GET')
    console.log('FAQ API response:', response)
    
    // Extract FAQs from the nested data structure
    const faqItems = response.data?.data?.faqs || []
    console.log('FAQ items received:', faqItems.length)
    
    // Map items to use correct question field based on language
    return faqItems.map((item: FAQItem) => {
      const isRussian = language === 'ru'
      return {
        ...item,
        question: isRussian ? item.question : (item.question_kz || item.question),
        answer: isRussian ? item.answer : (item.answer_kz || item.answer)
      }
    })
  } catch (error) {
    console.error('Error fetching FAQ:', error)
    throw error
  }
}
