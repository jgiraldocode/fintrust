# 🐛 Fix: Leaderboard con Valores Incorrectos

## ❌ **Problema Detectado**

El leaderboard mostraba valores completamente incorrectos:
- ✗ **Respuestas correctas**: "267/3" en lugar de "3/3"
- ✗ **Porcentajes**: Valores superiores al 100% (ej: 10,000%)
- ✗ **Causa**: Las consultas SQL sumaban valores de 0-100 como si fueran 0-1

---

## 🔍 **Análisis del Problema**

### **Sistema de Almacenamiento Actual**

Desde la implementación de múltiples respuestas, **TODAS** las respuestas se guardan en escala **0-100**:

```javascript
// En backend/routes/game.js - POST /answer
const scoreValue = Math.round(score * 100);

db.run(
  'INSERT INTO scores (id, user_id, question_id, is_correct) VALUES (?, ?, ?, ?)',
  [scoreId, userId, questionId, scoreValue],
  ...
);
```

**Ejemplos de valores guardados:**
- Respuesta única correcta: `score = 1.0` → `is_correct = 100`
- Respuesta única incorrecta: `score = 0.0` → `is_correct = 0`
- Respuesta múltiple 75% correcta: `score = 0.75` → `is_correct = 75`
- Respuesta múltiple 50% correcta: `score = 0.50` → `is_correct = 50`

### **Consulta SQL Problemática (ANTES)**

```sql
-- ❌ INCORRECTO
SELECT
  COUNT(s.id) as total_answers,
  SUM(s.is_correct) as correct_answers,                    -- ❌ Suma 100+100+100 = 300
  CAST(SUM(s.is_correct) AS FLOAT) * 100.0 / COUNT(s.id)  -- ❌ (300 * 100) / 3 = 10,000%
FROM scores s
```

**Resultado con 3 preguntas correctas:**
- `total_answers = 3` ✓
- `correct_answers = 100 + 100 + 100 = 300` ❌
- `score = (300 * 100) / 3 = 10,000%` ❌

---

## ✅ **Solución Implementada**

### **Nueva Consulta SQL (DESPUÉS)**

```sql
-- ✅ CORRECTO
SELECT
  COUNT(s.id) as total_answers,
  SUM(CASE WHEN s.is_correct >= 70 THEN 1 ELSE 0 END) as correct_answers,  -- ✅ Cuenta preguntas >= 70%
  COALESCE(AVG(s.is_correct), 0) as score                                   -- ✅ Promedia valores 0-100
FROM scores s
```

**Resultado con 3 preguntas correctas:**
- `total_answers = 3` ✓
- `correct_answers = 1 + 1 + 1 = 3` ✓ (cada una >= 70)
- `score = (100 + 100 + 100) / 3 = 100%` ✓

---

## 📊 **Ejemplos de Cálculos**

### **Ejemplo 1: Usuario con 3 preguntas correctas al 100%**

**Datos en DB:**
```
is_correct = [100, 100, 100]
```

**Cálculos ANTES (❌ incorrecto):**
- `correct_answers = 100 + 100 + 100 = 300`
- `score = (300 * 100) / 3 = 10,000%`

**Cálculos AHORA (✅ correcto):**
- `correct_answers = (100>=70?1:0) + (100>=70?1:0) + (100>=70?1:0) = 3`
- `score = (100 + 100 + 100) / 3 = 100%`

---

### **Ejemplo 2: Usuario con respuestas mixtas**

**Datos en DB:**
```
is_correct = [100, 75, 50, 0]
```

**Cálculos ANTES (❌ incorrecto):**
- `correct_answers = 100 + 75 + 50 + 0 = 225`
- `score = (225 * 100) / 4 = 5,625%`

**Cálculos AHORA (✅ correcto):**
- `correct_answers = 1 + 1 + 0 + 0 = 2` (solo las que tienen >= 70%)
- `score = (100 + 75 + 50 + 0) / 4 = 56.25%`

---

### **Ejemplo 3: Usuario con respuestas múltiples parciales**

**Datos en DB:**
```
is_correct = [100, 80, 67, 45]
```

**Cálculos ANTES (❌ incorrecto):**
- `correct_answers = 100 + 80 + 67 + 45 = 292`
- `score = (292 * 100) / 4 = 7,300%`

**Cálculos AHORA (✅ correcto):**
- `correct_answers = 1 + 1 + 0 + 0 = 2` (100>=70 ✓, 80>=70 ✓, 67>=70 ✗, 45>=70 ✗)
- `score = (100 + 80 + 67 + 45) / 4 = 73%`

---

## 🔧 **Cambios en el Código**

### **1. Leaderboard Query (`GET /leaderboard`)**

**Archivo:** `backend/routes/game.js`

```sql
-- ANTES
SUM(s.is_correct) as correct_answers,
CAST(SUM(s.is_correct) AS FLOAT) * 100.0 / NULLIF(COUNT(s.id), 0) as score

-- AHORA
SUM(CASE WHEN s.is_correct >= 70 THEN 1 ELSE 0 END) as correct_answers,
COALESCE(AVG(s.is_correct), 0) as score
```

**Explicación:**
- `SUM(CASE WHEN s.is_correct >= 70 THEN 1 ELSE 0 END)`: Cuenta cuántas preguntas tienen un puntaje >= 70% (umbral de "correcto")
- `AVG(s.is_correct)`: Promedia los puntajes que ya están en escala 0-100
- `COALESCE(..., 0)`: Maneja el caso de usuarios sin respuestas

---

### **2. User Score Query (`GET /user-score/:userId`)**

**Archivo:** `backend/routes/game.js`

```sql
-- ANTES
SUM(s.is_correct) as correct_answers

-- AHORA
SUM(CASE WHEN s.is_correct >= 70 THEN 1 ELSE 0 END) as correct_answers
```

**Explicación:**
- Mismo cambio: cuenta preguntas con puntaje >= 70% en lugar de sumar valores directamente

---

## 🎯 **Umbral de 70% para "Correcto"**

Se utiliza **70%** como umbral para considerar una respuesta como "correcta" en el conteo. Esto aplica tanto a:

- **Respuestas únicas**:
  - `is_correct = 100` → Cuenta como correcta ✓
  - `is_correct = 0` → No cuenta como correcta ✗

- **Respuestas múltiples**:
  - `is_correct = 100` → Cuenta como correcta ✓
  - `is_correct = 75` → Cuenta como correcta ✓
  - `is_correct = 67` → No cuenta como correcta ✗
  - `is_correct = 50` → No cuenta como correcta ✗

**Nota:** El umbral de 70% coincide con el que se usa en la lógica de scoring en `POST /answer`:

```javascript
isCorrect = (correctSelections === correctAnswers.length && incorrectSelections === 0) || score >= 0.7;
```

---

## ✅ **Resultados Esperados Después del Fix**

### **Leaderboard**

```
┌──────┬─────────────┬──────────┬──────────────┬─────────┐
│ Rank │ Nombre      │ Total    │ Correctas    │ Score   │
├──────┼─────────────┼──────────┼──────────────┼─────────┤
│   1  │ Juan        │ 5        │ 5            │ 100.0%  │
│   2  │ María       │ 5        │ 4            │ 85.0%   │
│   3  │ Pedro       │ 5        │ 3            │ 65.0%   │
└──────┴─────────────┴──────────┴──────────────┴─────────┘
```

**Valores normales:**
- ✅ `Correctas` entre 0 y `Total`
- ✅ `Score` entre 0% y 100%
- ✅ Formato: "5/5" en lugar de "500/5"

---

## 🧪 **Testing**

### **Caso de Prueba 1: Solo Respuestas Únicas**

```sql
INSERT INTO scores (id, user_id, question_id, is_correct)
VALUES
  ('s1', 'user1', 'q1', 100),  -- Correcta
  ('s2', 'user1', 'q2', 100),  -- Correcta
  ('s3', 'user1', 'q3', 0);    -- Incorrecta
```

**Resultado esperado:**
- `total_answers = 3`
- `correct_answers = 2`
- `score = 66.67%`

---

### **Caso de Prueba 2: Solo Respuestas Múltiples**

```sql
INSERT INTO scores (id, user_id, question_id, is_correct)
VALUES
  ('s1', 'user2', 'q1', 100),  -- 100% correcta
  ('s2', 'user2', 'q2', 75),   -- 75% correcta
  ('s3', 'user2', 'q3', 50);   -- 50% correcta
```

**Resultado esperado:**
- `total_answers = 3`
- `correct_answers = 2` (100 y 75 son >= 70)
- `score = 75%`

---

### **Caso de Prueba 3: Respuestas Mixtas**

```sql
INSERT INTO scores (id, user_id, question_id, is_correct)
VALUES
  ('s1', 'user3', 'q1', 100),  -- Única correcta
  ('s2', 'user3', 'q2', 80),   -- Múltiple 80%
  ('s3', 'user3', 'q3', 60),   -- Múltiple 60%
  ('s4', 'user3', 'q4', 0);    -- Única incorrecta
```

**Resultado esperado:**
- `total_answers = 4`
- `correct_answers = 2` (100 y 80 son >= 70)
- `score = 60%` = (100 + 80 + 60 + 0) / 4

---

## 📝 **Notas Importantes**

1. **Retrocompatibilidad**: Si existieran registros antiguos con valores 0 o 1, la nueva consulta también los maneja correctamente:
   - `is_correct = 1` → `1 >= 70` es falso, no cuenta como correcta ❌
   - **Solución**: Estos registros necesitarían migración (1 → 100, 0 → 0)

2. **Umbral configurable**: Si se desea cambiar el umbral de 70% a otro valor, solo hay que modificar el número en las consultas SQL.

3. **Consistencia**: Ambas consultas (`/leaderboard` y `/user-score/:userId`) usan la misma lógica para garantizar consistencia.

---

## ✅ **Estado del Fix**

- ✅ Consulta de leaderboard corregida
- ✅ Consulta de user-score corregida
- ✅ Comentarios agregados al código para claridad
- ✅ Documentación completa del problema y solución

---

**¡El leaderboard ahora muestra valores correctos!** 🎉

- Respuestas correctas: Conteo real entre 0 y total
- Porcentajes: Valores normales entre 0% y 100%
- Cálculo consistente para preguntas únicas y múltiples

