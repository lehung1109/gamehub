import { PronunciationResult, WordEvaluation } from '@/types/pronunciation';

function cleanWord(str: string): string {
  return str.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').trim();
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function wordSimilarity(word1: string, word2: string): number {
  if (word1 === word2) return 100;
  const maxLen = Math.max(word1.length, word2.length);
  if (maxLen === 0) return 100;
  const dist = levenshteinDistance(word1, word2);
  const similarity = Math.max(0, (1 - dist / maxLen) * 100);
  return Math.round(similarity);
}

export function evaluatePronunciation(
  targetText: string,
  spokenText: string,
  passThreshold = 70
): PronunciationResult {
  const targetTokens = targetText.split(/\s+/).filter(Boolean);
  const spokenTokens = spokenText.split(/\s+/).filter(Boolean).map(cleanWord);

  if (targetTokens.length === 0) {
    return {
      accuracy: 0,
      stars: 1,
      feedbackVi: 'Không có nội dung mẫu để đối chiếu.',
      wordDetails: [],
      isPassed: false,
    };
  }

  const wordDetails: WordEvaluation[] = targetTokens.map((rawTargetWord, index) => {
    const cleanedTarget = cleanWord(rawTargetWord);
    const candidateSpoken = spokenTokens[index] || '';

    // Direct match or high similarity threshold
    const directScore = wordSimilarity(cleanedTarget, candidateSpoken);
    
    // Also check if spoken anywhere in the sentence for word transposition tolerance
    let bestScore = directScore;
    if (directScore < 80) {
      for (const sp of spokenTokens) {
        const altScore = wordSimilarity(cleanedTarget, sp);
        if (altScore > bestScore) {
          bestScore = altScore;
        }
      }
    }

    const isMatch = bestScore >= 80;
    return {
      word: rawTargetWord,
      isMatch,
      score: bestScore,
    };
  });

  const matchedCount = wordDetails.filter((w) => w.isMatch).length;
  const accuracy = Math.round((matchedCount / targetTokens.length) * 100);
  const isPassed = accuracy >= passThreshold;

  let stars: 1 | 2 | 3 = 1;
  let feedbackVi = 'Cần luyện tập thêm. Hãy nghe lại âm mẫu và thử lại nhé!';

  if (accuracy >= 90) {
    stars = 3;
    feedbackVi = 'Xuất sắc! Bạn phát âm rất chuẩn xác và rõ ràng.';
  } else if (accuracy >= passThreshold) {
    stars = 2;
    feedbackVi = 'Rất tốt! Cố gắng nhấn chuẩn các từ chưa chính xác nhé.';
  }

  return {
    accuracy,
    stars,
    feedbackVi,
    wordDetails,
    isPassed,
  };
}
