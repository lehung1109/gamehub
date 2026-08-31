import re

with open('tests/unit/tenses/TenseLessonContainer.test.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

mock_data_replacement = """
const mockLessonData = JSON.parse(JSON.stringify(presentSimpleData)) as unknown as TenseModuleData;
// Inject dummy data for UI tests to pass regardless of actual JSON content
mockLessonData.challenges.conjugation[0] = {
  id: "test-conj-1",
  contextType: "email",
  scenarioVi: "Test scenario",
  textBefore: "He ",
  baseVerb: "meet",
  textAfter: " the team.",
  correctAnswer: "meets",
  options: ["meet", "meets"],
  explanation: { ruleVi: "Test", detailedAnalysisVi: "Test" }
};
mockLessonData.challenges.errorHunting[0] = {
  id: "test-err-1",
  scenarioVi: "Test scenario",
  tokens: ["He", "don't", "like", "it."],
  errorTokenIndex: 1,
  correctToken: "doesn't",
  options: [
    { value: "don't", label: "don't", isCorrect: false },
    { value: "doesn't", label: "doesn't", isCorrect: true }
  ],
  fullCorrectSentence: "He doesn't like it.",
  vietnameseMeaning: "Anh ấy không thích nó.",
  explanation: { whyWrongVi: "Test", workplaceImpactVi: "Test" }
};
mockLessonData.challenges.sentenceBuilding[0] = {
  id: "test-sb-1",
  scenarioVi: "Test scenario",
  vietnameseMeaning: "Hệ thống tự động tạo log.",
  scrambledTokens: [
    { id: "t1", text: "The" },
    { id: "t2", text: "system" },
    { id: "t3", text: "generates" },
    { id: "t4", text: "logs" },
    { id: "t5", text: "automatically." }
  ],
  correctTokenOrder: ["The", "system", "generates", "logs", "automatically."],
  fullSentenceEn: "The system generates logs automatically.",
  grammarTip: { titleVi: "Test", tipVi: "Test" }
};
"""

content = re.sub(
    r"const mockLessonData = presentSimpleData as unknown as TenseModuleData;",
    mock_data_replacement,
    content
)

with open('tests/unit/tenses/TenseLessonContainer.test.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
