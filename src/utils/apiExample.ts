/**
 * Пример использования API с декодированием Unicode
 */

import { SpecialtiesApi } from '../api/specialties';
import { decodeApiData } from './unicodeDecoder';

/**
 * Пример функции для получения специальностей с автоматическим декодированием
 */
export const getSpecialtiesExample = async () => {
  try {
    // Выполняем запрос к API
    const response = await SpecialtiesApi('your-clinic-id', {}, 'GET');
    
    // Данные уже декодированы автоматически через interceptor в https.ts
    console.log('Декодированные данные:', response.data);
    
    // Если нужно дополнительное декодирование (например, для старых данных)
    const decodedData = decodeApiData(response.data);
    console.log('Дополнительно декодированные данные:', decodedData);
    
    return decodedData;
  } catch (error) {
    console.error('Ошибка при получении специальностей:', error);
    throw error;
  }
};

/**
 * Пример обработки данных с Unicode escape-последовательностями
 */
export const processSpecialtyData = (rawData: any) => {
  // Проверяем, есть ли Unicode escape-последовательности
  const hasUnicode = JSON.stringify(rawData).includes('\\u');
  
  if (hasUnicode) {
    console.log('Обнаружены Unicode escape-последовательности, декодируем...');
    return decodeApiData(rawData);
  }
  
  return rawData;
};

/**
 * Пример использования в компоненте Vue
 */
export const useSpecialtiesInComponent = () => {
  const loadSpecialties = async () => {
    try {
      const response = await SpecialtiesApi('clinic-id', {}, 'GET');
      
      // Данные уже декодированы автоматически
      const specialties = response.data.clinic_specialties;
      
      // Обрабатываем каждую специальность
      const processedSpecialties = specialties.map((specialty: any) => ({
        id: specialty.id,
        name: specialty.shared_specialty.name, // Уже декодировано
        nameKz: specialty.shared_specialty.name_kz, // Уже декодировано
        description: specialty.description, // Уже декодировано
        descriptionKz: specialty.description_kz, // Уже декодировано
      }));
      
      return processedSpecialties;
    } catch (error) {
      console.error('Ошибка загрузки специальностей:', error);
      return [];
    }
  };
  
  return { loadSpecialties };
};

