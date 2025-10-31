# Решение проблемы с Unicode escape-последовательностями в API

## Проблема
API возвращает данные в формате Unicode escape-последовательностей:
```json
{
  "name": "\\u0412\\u0440\\u0430\\u0447 \\u043e\\u0431\\u0449\\u0435\\u0439 \\u043f\\u0440\\u0430\\u043a\\u0442\\u0438\\u043a\\u0438"
}
```

Вместо читаемого текста:
```json
{
  "name": "Врач общей практики"
}
```

## Решение

### 1. Автоматическое декодирование в HTTP interceptor
В файле `src/utils/https.ts` добавлен response interceptor, который автоматически декодирует все Unicode escape-последовательности в ответах API.

### 2. Утилиты для ручного декодирования
Создан файл `src/utils/unicodeDecoder.ts` с функциями:
- `decodeUnicodeString()` - декодирует строку
- `decodeUnicodeObject()` - рекурсивно декодирует объект
- `decodeApiData()` - универсальная функция для декодирования данных API

### 3. Правильная кодировка запросов
Настроены правильные заголовки для UTF-8 кодировки:
```typescript
headers: {
  "Content-Type": "application/json; charset=utf-8",
  "Accept": "application/json; charset=utf-8",
}
```

## Использование

### Автоматическое декодирование
Все запросы через `http` instance автоматически декодируют Unicode escape-последовательности:

```typescript
import http from '../utils/https';

const response = await http.get('/api/specialties');
// response.data уже содержит декодированные данные
console.log(response.data.name); // "Врач общей практики"
```

### Ручное декодирование
Если нужно декодировать данные вручную:

```typescript
import { decodeApiData } from '../utils/unicodeDecoder';

const rawData = { name: "\\u0412\\u0440\\u0430\\u0447" };
const decodedData = decodeApiData(rawData);
console.log(decodedData.name); // "Врач"
```

### В компонентах Vue
```typescript
import { decodeApiData } from '../utils/unicodeDecoder';

// В setup() или methods
const processApiData = (data: any) => {
  return decodeApiData(data);
};
```

## Тестирование

Для проверки работы декодирования:

```typescript
import { decodeUnicodeString } from '../utils/unicodeDecoder';

const testString = "\\u0412\\u0440\\u0430\\u0447 \\u043e\\u0431\\u0449\\u0435\\u0439 \\u043f\\u0440\\u0430\\u043a\\u0442\\u0438\\u043a\\u0438";
const decoded = decodeUnicodeString(testString);
console.log(decoded); // "Врач общей практики"
```

## Примечания

1. **Автоматическое декодирование** работает для всех запросов через `http` instance
2. **Производительность**: декодирование происходит только при наличии Unicode escape-последовательностей
3. **Совместимость**: решение работает с любыми данными API
4. **Безопасность**: функция проверяет типы данных перед обработкой

## Файлы

- `src/utils/https.ts` - основной HTTP client с автоматическим декодированием
- `src/utils/unicodeDecoder.ts` - утилиты для декодирования
- `src/utils/apiExample.ts` - примеры использования

