/**
 * Тест для проверки работы декодирования Unicode escape-последовательностей
 */

import { decodeUnicodeString, decodeUnicodeObject, decodeApiData } from './unicodeDecoder';

// Тестовые данные
const testData = {
  "clinic_specialties": [
    {
      "id": "cf71047a-ff63-4fce-96fb-608898715908",
      "clinic_id": "578b99c8-1234-4537-af69-640f8edf77cd",
      "description": "",
      "description_kz": "",
      "is_active": true,
      "shared_specialty": {
        "id": "caa7c093-daec-44a5-8cff-3c1218f22245",
        "name": "\\u0412\\u0440\\u0430\\u0447 \\u043e\\u0431\\u0449\\u0435\\u0439 \\u043f\\u0440\\u0430\\u043a\\u0442\\u0438\\u043a\\u0438",
        "name_kz": "\\u0416\\u0430\\u043b\\u043f\\u044b \\u0442\\u04d9\\u0436\\u0456\\u0440\\u0438\\u0431\\u0435\\u043b\\u0456\\u043a \\u0434\\u04d9\\u0440\\u0456\\u0433\\u0435\\u0440",
        "description": "",
        "description_kz": "",
        "is_active": true,
        "created_date": "2025-08-20T06:51:04.967522Z",
        "updated_date": "2025-08-26T10:57:14.564663Z"
      },
      "created_date": "2025-08-22T07:22:47.466Z",
      "updated_date": "2025-08-22T07:22:47.466Z"
    }
  ]
};

/**
 * Функция для тестирования декодирования
 */
export const testUnicodeDecoding = () => {
  console.log('=== Тест декодирования Unicode escape-последовательностей ===');
  
  // Тест 1: Декодирование строки
  const testString = "\\u0412\\u0440\\u0430\\u0447 \\u043e\\u0431\\u0449\\u0435\\u0439 \\u043f\\u0440\\u0430\\u043a\\u0442\\u0438\\u043a\\u0438";
  const decodedString = decodeUnicodeString(testString);
  console.log('Исходная строка:', testString);
  console.log('Декодированная строка:', decodedString);
  console.log('Ожидаемый результат: "Врач общей практики"');
  console.log('Результат корректен:', decodedString === "Врач общей практики");
  console.log('');
  
  // Тест 2: Декодирование объекта
  const decodedObject = decodeUnicodeObject(testData);
  console.log('Исходные данные:', JSON.stringify(testData, null, 2));
  console.log('Декодированные данные:', JSON.stringify(decodedObject, null, 2));
  console.log('');
  
  // Тест 3: Проверка конкретных полей
  const specialty = decodedObject.clinic_specialties[0];
  console.log('Название специальности (ru):', specialty.shared_specialty.name);
  console.log('Название специальности (kz):', specialty.shared_specialty.name_kz);
  console.log('');
  
  // Тест 4: Использование decodeApiData
  const apiData = decodeApiData(testData);
  console.log('Данные через decodeApiData:', apiData.clinic_specialties[0].shared_specialty.name);
  
  return {
    original: testData,
    decoded: decodedObject,
    success: decodedString === "Врач общей практики"
  };
};

/**
 * Функция для тестирования в браузере
 */
export const runUnicodeTest = () => {
  if (typeof window !== 'undefined') {
    const result = testUnicodeDecoding();
    console.log('Тест завершен. Успешно:', result.success);
    return result;
  } else {
    console.log('Тест можно запустить только в браузере');
    return null;
  }
};

// Автоматический запуск теста в браузере
if (typeof window !== 'undefined') {
  console.log('Запуск теста Unicode декодирования...');
  runUnicodeTest();
}

