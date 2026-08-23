# Contract: `getStudentProgress` Server Action

## Overview
This Server Action allows the client to fetch a student's total stars based on their classroom code and name.

## Input

```typescript
type GetStudentProgressInput = {
  classCode: string;
  studentName: string;
}
```

## Output

```typescript
type GetStudentProgressOutput = {
  success: boolean;
  totalStars: number;
  error?: string;
}
```

## Behavior

1. **Validation**: Ensures `classCode` and `studentName` are valid strings.
2. **Lookup**: Finds the `classroom_id` using `classCode`, then finds the `student_id` in the `students` table.
3. **Aggregation**: Queries `game_sessions` for the `student_id`, fetching the `score` column. Sums the scores. Null scores are treated as 0.
4. **Error Handling**: Returns `success: false` and an error message if the classroom or student is not found (which means the student hasn't played yet or logged in with invalid info). If the student hasn't played any games but exists, it returns `totalStars: 0`.

## Example Usage

```typescript
import { getStudentProgress } from '@/app/actions/student-progress'

const result = await getStudentProgress({ classCode: 'ABC123', studentName: 'Bé Linh' });
if (result.success) {
  console.log('Total stars:', result.totalStars);
} else {
  console.error(result.error);
}
```
