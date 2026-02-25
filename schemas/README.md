# Sanity Schemas

Este archivo `platformSurveyResponse.ts` define el schema para las respuestas del cuestionario de experiencia.

**Para agregarlo a tu Sanity Studio:**

1. Copia el archivo `platformSurveyResponse.ts` a la carpeta `schemas` de tu proyecto Sanity Studio.
2. En el archivo `schemas/index.ts` de tu Sanity Studio, importa y exporta el schema:

```ts
import platformSurveyResponse from './platformSurveyResponse'

export const schemaTypes = [
  // ... tus otros schemas
  platformSurveyResponse,
]
```

3. Ejecuta el deploy de tu Sanity Studio para que el nuevo tipo de documento esté disponible.
