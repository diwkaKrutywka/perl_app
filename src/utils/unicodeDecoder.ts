/**
 * Утилиты для декодирования Unicode escape-последовательностей
 */

/**
 * Декодирует Unicode escape-последовательности в строке
 * @param str - строка с Unicode escape-последовательностями
 * @returns декодированная строка
 */
export const decodeUnicodeString = (str: string): string => {
  if (typeof str !== 'string') return str;
  
  return str.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
    return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
  });
};

/**
 * Рекурсивно декодирует Unicode escape-последовательности в объекте
 * @param obj - объект для декодирования
 * @returns декодированный объект
 */
export const decodeUnicodeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return decodeUnicodeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(decodeUnicodeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const decoded: any = {};
    for (const key in obj) {
      decoded[key] = decodeUnicodeObject(obj[key]);
    }
    return decoded;
  }
  
  return obj;
};

/**
 * Проверяет, содержит ли строка Unicode escape-последовательности
 * @param str - строка для проверки
 * @returns true, если содержит Unicode escape-последовательности
 */
export const hasUnicodeEscapes = (str: string): boolean => {
  return /\\u[\dA-Fa-f]{4}/.test(str);
};

/**
 * Декодирует данные API, если они содержат Unicode escape-последовательности
 * @param data - данные API
 * @returns декодированные данные
 */
export const decodeApiData = (data: any): any => {
  if (!data) return data;
  
  // Если это строка и содержит Unicode escape-последовательности
  if (typeof data === 'string' && hasUnicodeEscapes(data)) {
    return decodeUnicodeString(data);
  }
  
  // Если это объект или массив, рекурсивно обрабатываем
  if (typeof data === 'object') {
    return decodeUnicodeObject(data);
  }
  
  return data;
};

