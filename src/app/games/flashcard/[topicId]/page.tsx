import { notFound } from "next/navigation";
import { BackButton } from "@/components/custom/BackButton";
import { FlashcardStack } from "@/components/game/FlashcardStack";
import topics from "@/data/topics.json";
import { Word } from "@/types";

import animalsWords from "@/data/words/animals.json";
import fruitsWords from "@/data/words/fruits.json";
import familyWords from "@/data/words/family.json";
import schoolWords from "@/data/words/school.json";
import bodyPartsWords from "@/data/words/body-parts.json";

const topicWordsMap: Record<string, Word[]> = {
  animals: animalsWords,
  fruits: fruitsWords,
  family: familyWords,
  school: schoolWords,
  "body-parts": bodyPartsWords,
};

export function generateStaticParams() {
  return topics.map((topic) => ({
    topicId: topic.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = topics.find((t) => t.id === topicId);

  if (!topic) {
    return {
      title: "Chủ đề không tồn tại | Flashcard Game",
    };
  }

  return {
    title: `${topic.nameVi} (${topic.nameEn}) - Học từ vựng Flashcard`,
    description: `Học ${topicWordsMap[topicId]?.length || 0} từ vựng chủ đề ${topic.nameVi} qua flashcard tương tác có phát âm`,
  };
}

export default async function FlashcardTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = topics.find((t) => t.id === topicId);

  if (!topic) {
    notFound();
  }

  const words = topicWordsMap[topicId] || [];

  return (
    <main className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 className="sr-only">Học từ vựng chủ đề {topic.nameVi} - Flashcard Game</h1>

      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <BackButton href="/games/flashcard" label="Chọn chủ đề" />
        <div className="text-right">
          <span className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Flashcard
          </span>
        </div>
      </div>

      {/* Main Flashcard Interaction */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <FlashcardStack
          words={words}
          topicTitle={`${topic.emoji} ${topic.nameVi}`}
        />
      </div>
    </main>
  );
}
