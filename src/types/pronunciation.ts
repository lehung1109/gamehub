export interface WordEvaluation {
  word: string;
  isMatch: boolean;
  score: number;
}

export interface PronunciationResult {
  accuracy: number;
  stars: 1 | 2 | 3;
  feedbackVi: string;
  wordDetails: WordEvaluation[];
  isPassed: boolean;
}

export interface PronunciationItem {
  id: string;
  targetText: string;
  phonetic: string;
  vietnameseMeaning: string;
  focusSound?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'minimal-pairs' | 'workplace-words' | 'standup-phrases';
}

export interface PronunciationTopic {
  id: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  icon: string;
}
