# ✅ Funcionalidad de Múltiples Respuestas Restaurada

## 📋 Resumen

La funcionalidad de preguntas con múltiples respuestas correctas ha sido completamente restaurada en el sistema. Esta característica permite que el administrador cree preguntas donde los usuarios pueden seleccionar múltiples opciones correctas y recibir puntaje parcial basado en sus selecciones.

---

## 🔄 Cambios Implementados

### 1. **Backend - Base de Datos** ✅

La base de datos ya tiene las columnas necesarias:

```sql
-- Tabla questions
allow_multiple_answers INTEGER DEFAULT 0
correct_answers_json TEXT
```

### 2. **Backend - API Routes** ✅

#### **`backend/routes/admin.js`**

- **GET `/admin/questions`**: Retorna `correctAnswers` y `allowMultipleAnswers` para cada pregunta
- **POST `/admin/questions`**: Acepta y valida `correctAnswers` (array) y `allowMultipleAnswers` (boolean)
- **PUT `/admin/questions/:id`**: Actualiza preguntas con soporte para múltiples respuestas

#### **`backend/routes/game.js`**

- **GET `/questions`**: Incluye el campo `allowMultipleAnswers` en la respuesta (sin revelar las respuestas correctas)
- **POST `/answer`**:
  - Acepta respuestas como array o valor único
  - Calcula puntaje parcial para preguntas de múltiples respuestas
  - Formula de puntaje: `(selecciones correctas / total correctas) - (selecciones incorrectas / total opciones)`
  - Considera correcta una pregunta si el puntaje es ≥ 0.7 o si todas las respuestas correctas fueron seleccionadas sin incorrectas
  - Guarda el puntaje como entero 0-100 en la columna `is_correct` para compatibilidad

### 3. **Frontend - Panel Administrativo** ✅

#### **`frontend/src/views/AdminView.vue`**

**Nuevos campos en el formulario:**
- ✅ Toggle "Permitir múltiples respuestas correctas"
- ✅ Vista condicional:
  - **Single answer**: Dropdown tradicional
  - **Multiple answers**: Checkboxes con selección múltiple

**Funciones actualizadas:**
- `questionForm`: Incluye `correctAnswers` y `allowMultipleAnswers`
- `saveQuestion`: Valida y envía datos según el tipo de pregunta
- `editQuestion`: Carga correctamente los datos de preguntas con múltiples respuestas
- `cancelEdit`: Limpia los nuevos campos

### 4. **Frontend - Vista del Juego** ✅

#### **`frontend/src/views/GameView.vue`**

**Nuevos estados:**
```javascript
const selectedAnswer = ref(null)      // Para respuestas únicas
const selectedAnswers = ref([])       // Para respuestas múltiples
```

**Funciones actualizadas:**

- **`selectOption(index)`**:
  - Detecta si la pregunta permite múltiples respuestas
  - Toggle de selección para múltiples respuestas (agrega/quita del array)
  - Selección única para preguntas tradicionales

- **`submitSelectedAnswer()`**:
  - Valida que haya al menos una selección
  - Envía array o valor único según el tipo de pregunta
  - Mensajes personalizados para cada tipo

- **`nextQuestion()`**:
  - Limpia tanto `selectedAnswer` como `selectedAnswers`

**UI actualizada:**

- ✅ **Checkboxes visuales** para preguntas de múltiples respuestas
- ✅ **Texto del botón dinámico**: "Enviar Respuesta" vs "Enviar Respuestas"
- ✅ **Feedback visual mejorado**:
  - Respuestas correctas seleccionadas: Verde brillante
  - Respuestas incorrectas seleccionadas: Rojo
  - Respuestas correctas no seleccionadas: Verde suave
  - Muestra el puntaje parcial: "🎯 Puntaje: 75%"

---

## 🎯 Cómo Funciona

### Creación de Pregunta con Múltiples Respuestas

1. **Admin activa el toggle** "Permitir múltiples respuestas correctas"
2. **Selecciona múltiples opciones** usando los checkboxes
3. **Guarda la pregunta** → Se envía `correctAnswers: [0, 2, 3]` y `allowMultipleAnswers: true`

### Usuario Responde

1. **Frontend detecta** `allowMultipleAnswers: true`
2. **Muestra checkboxes** en lugar de botones únicos
3. **Usuario selecciona múltiples opciones** (ej: [0, 3])
4. **Envía al backend**: `answer: [0, 3]`

### Cálculo de Puntaje

Supongamos:
- **Respuestas correctas**: `[0, 2, 3]` (3 opciones)
- **Respuesta del usuario**: `[0, 3]` (2 selecciones)
- **Total de opciones**: 4

**Cálculo:**
```javascript
correctSelections = 2       // Seleccionó 0 y 3 (ambas correctas)
incorrectSelections = 0     // No seleccionó ninguna incorrecta
totalCorrect = 3            // Hay 3 respuestas correctas
totalOptions = 4            // 4 opciones en total

correctScore = 2 / 3 = 0.667
incorrectPenalty = 0 / 4 = 0
score = 0.667 - 0 = 0.667 (66.7%)

isCorrect = false           // Porque score < 0.7 y no seleccionó todas las correctas
```

Si el usuario selecciona `[0, 2, 3]` (todas las correctas):
```javascript
correctScore = 3 / 3 = 1.0
incorrectPenalty = 0 / 4 = 0
score = 1.0 - 0 = 1.0 (100%)

isCorrect = true            // Todas las correctas seleccionadas sin incorrectas
```

### Leaderboard y Puntajes

El sistema normaliza los puntajes en el leaderboard:

```sql
-- Calcula respuestas correctas
SUM(CASE
  WHEN s.is_correct > 1 THEN
    CASE WHEN s.is_correct >= 70 THEN 1 ELSE 0 END
  ELSE s.is_correct
END)

-- Calcula puntaje promedio
AVG(CASE
  WHEN s.is_correct > 1 THEN
    CAST(s.is_correct AS FLOAT) / 100.0
  ELSE CAST(s.is_correct AS FLOAT)
END) * 100.0
```

---

## 🎨 Interfaz de Usuario

### Panel Admin - Crear Pregunta

```
┌────────────────────────────────────────────┐
│ ☐ Permitir múltiples respuestas correctas │
│   (Toggle checkbox)                        │
└────────────────────────────────────────────┘

Respuestas Correctas:
┌────────────────────────────────────────────┐
│ ☑ Opción 1: Empresa A (PRIMARY BORDER)    │
│ ☐ Opción 2: Empresa B                     │
│ ☑ Opción 3: Empresa C (PRIMARY BORDER)    │
│ ☐ Opción 4: Empresa D                     │
└────────────────────────────────────────────┘
```

### Vista del Juego - Múltiples Respuestas

```
Pregunta: ¿Cuáles de las siguientes son empresas de tecnología?

┌────────────────────────────────────────────┐
│ [✓] A. Microsoft                           │  ← Seleccionada
├────────────────────────────────────────────┤
│ [ ] B. Walmart                             │
├────────────────────────────────────────────┤
│ [✓] C. Google                              │  ← Seleccionada
├────────────────────────────────────────────┤
│ [ ] D. Coca-Cola                           │
└────────────────────────────────────────────┘

[📤 Enviar Respuestas]
```

### Feedback con Puntaje Parcial

```
┌────────────────────────────────────────────┐
│ ✅ ¡Correcto!                              │
│                                            │
│ 🎯 Puntaje: 75%                           │
│    (0.75 puntos)                          │
│                                            │
│ 💡 Consejo: Ambas son empresas líderes... │
│                                            │
│ [Siguiente Pregunta →]                     │
└────────────────────────────────────────────┘
```

---

## 🧪 Pruebas Recomendadas

### Prueba 1: Crear Pregunta con Múltiples Respuestas
1. ✅ Activar el toggle de múltiples respuestas
2. ✅ Seleccionar 2+ opciones como correctas
3. ✅ Guardar y verificar que se creó correctamente

### Prueba 2: Editar Pregunta Existente
1. ✅ Editar una pregunta de respuesta única
2. ✅ Cambiar a múltiples respuestas
3. ✅ Seleccionar múltiples correctas y guardar
4. ✅ Verificar que los cambios se guardaron

### Prueba 3: Responder Pregunta con Múltiples Respuestas
1. ✅ Iniciar el juego
2. ✅ Ver que aparecen checkboxes en preguntas de múltiples respuestas
3. ✅ Seleccionar varias opciones
4. ✅ Enviar y verificar el puntaje parcial

### Prueba 4: Puntaje Parcial
1. ✅ Crear pregunta con 3 respuestas correctas
2. ✅ Seleccionar solo 2 correctas
3. ✅ Verificar que muestra puntaje parcial (ej: 66%)

### Prueba 5: Penalización por Incorrectas
1. ✅ Seleccionar 2 correctas + 1 incorrecta
2. ✅ Verificar que el puntaje es menor debido a la penalización

### Prueba 6: Leaderboard
1. ✅ Completar el juego con preguntas mixtas (únicas y múltiples)
2. ✅ Verificar que el leaderboard muestra correctamente los puntajes

---

## 📊 Ejemplo Completo

### JSON de Pregunta en DB:

```json
{
  "id": "abc-123",
  "question_text": "¿Qué nodos representan personas?",
  "options_json": "[\"Nodo A\", \"Nodo B\", \"Nodo C\", \"Nodo D\"]",
  "correct_answer": 0,
  "correct_answers_json": "[0, 2]",
  "allow_multiple_answers": 1,
  "tip": "Las personas tienen características específicas en el grafo"
}
```

### Respuesta del Backend (GET /questions):

```json
{
  "id": "abc-123",
  "questionText": "¿Qué nodos representan personas?",
  "options": ["Nodo A", "Nodo B", "Nodo C", "Nodo D"],
  "allowMultipleAnswers": true,
  "tip": "Las personas tienen características específicas en el grafo",
  "graphData": { /* ... */ }
}
```

### Envío de Respuesta (POST /answer):

```json
{
  "userId": "user-123",
  "questionId": "abc-123",
  "answer": [0, 2]
}
```

### Respuesta del Backend:

```json
{
  "isCorrect": true,
  "score": 1.0,
  "correctAnswer": [0, 2],
  "tip": "Las personas tienen características específicas en el grafo"
}
```

---

## ✅ Estado Actual

- ✅ Base de datos con columnas correctas
- ✅ Backend API completo para crear, editar y responder
- ✅ Frontend Admin con UI de múltiples respuestas
- ✅ Frontend Game con checkboxes y puntaje parcial
- ✅ Sistema de scoring con penalización
- ✅ Leaderboard normalizado para preguntas mixtas
- ✅ Redirección automática cuando usuario no está registrado

---

## 🔄 Integración con Redirección de Usuarios

Además de restaurar las múltiples respuestas, se implementó:

- ✅ **Validación de usuario**: Si el usuario no existe, redirige a `/register`
- ✅ **Errores 404/400**: Redireccionan automáticamente a registro
- ✅ **Sin userId en store**: Redirige inmediatamente

---

## 📝 Notas Importantes

1. **Compatibilidad hacia atrás**: Las preguntas de respuesta única siguen funcionando exactamente igual
2. **Almacenamiento de puntaje**: Se usa `is_correct` (0-100) para ambos tipos de preguntas
3. **Umbral de corrección**: Para múltiples respuestas, score ≥ 70% se considera correcto
4. **UI adaptativa**: El frontend detecta automáticamente el tipo de pregunta y ajusta la UI

---

¡La funcionalidad de múltiples respuestas está completamente restaurada y lista para usar! 🎉

