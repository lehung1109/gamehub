# Tracking API Contract

This contract defines the internal API used by the Next.js client to securely submit game results to the server, bypassing RLS limitations for unauthenticated students.

## `POST /api/track`

Records a completed game session and its details.

### Request Body (JSON)

```typescript
{
  // Student context
  classCode: string;
  studentName: string;
  
  // Game session context
  gameType: string;         // 'listening', 'spelling', etc.
  topic: string;
  score?: number;           // Can be omitted for games without scoring (like flashcards)
  totalQuestions: number;
  startedAt: string;        // ISO 8601 date string
  completedAt: string;      // ISO 8601 date string
  configId?: string;
  
  // Detailed results
  details: Array<{
    prompt: string;
    selectedAnswer?: string;
    correctAnswer?: string;
    isCorrect: boolean;
    timeTakenMs: number;
    attempts?: number;
  }>;
}
```

### Success Response (`200 OK`)

```json
{
  "success": true
}
```

### Error Responses

**`400 Bad Request`** - Invalid payload structure or missing required fields.
```json
{
  "error": "Invalid request payload",
  "details": ["classCode is required", "studentName is required"]
}
```

**`404 Not Found`** - Class code does not exist or is inactive.
```json
{
  "error": "Mã lớp không đúng rồi, bé hãy kiểm tra lại nhé! 🔍"
}
```

**`500 Internal Server Error`** - Database insertion failed. (Note: Client should suppress this error visually to prevent disrupting gameplay).
```json
{
  "error": "Internal server error"
}
```
