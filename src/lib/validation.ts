export function validateAnswer(input: string, correctAnswer: string, acceptableAlternatives: string[] = []): boolean {
  const normalize = (str: string) => str.trim().toLowerCase();
  
  const normalizedInput = normalize(input);
  if (normalizedInput === normalize(correctAnswer)) {
    return true;
  }
  
  for (const alt of acceptableAlternatives) {
    if (normalizedInput === normalize(alt)) {
      return true;
    }
  }
  
  return false;
}
