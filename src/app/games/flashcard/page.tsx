import Link from "next/link";
import { BackButton } from "@/components/custom/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import topics from "@/data/topics.json";
import animalsWords from "@/data/words/animals.json";
import fruitsWords from "@/data/words/fruits.json";
import familyWords from "@/data/words/family.json";
import schoolWords from "@/data/words/school.json";
import bodyPartsWords from "@/data/words/body-parts.json";
import { Sparkles, BookOpen } from "lucide-react";

const wordCounts: Record<string, number> = {
  animals: animalsWords.length,
  fruits: fruitsWords.length,
  family: familyWords.length,
  school: schoolWords.length,
  "body-parts": bodyPartsWords.length,
};

export const metadata = {
  title: "Học từ vựng qua Flashcard | English Games for Kids",
  description: "Chọn chủ đề từ vựng để học tiếng Anh qua thẻ lật flashcard sinh động",
};

export default function FlashcardTopicSelectionPage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <BackButton href="/" label="Về trang chủ" />
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
          <BookOpen className="w-6 h-6 stroke-[2.5]" />
          <span className="hidden sm:inline">6-7 tuổi</span>
        </div>
      </div>

      {/* Page Title & Intro */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Flashcard Game</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
          Học từ vựng qua Flashcard
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto font-medium">
          Chọn một chủ đề yêu thích để bắt đầu khám phá các từ vựng tiếng Anh kèm phát âm chuẩn nhé!
        </p>
      </div>

      {/* Topic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {topics.map((topic) => {
          const count = wordCounts[topic.id] || 0;
          return (
            <Link
              key={topic.id}
              href={`/games/flashcard/${topic.id}`}
              className="group block outline-none focus-visible:ring-4 focus-visible:ring-primary rounded-3xl"
            >
              <Card className="h-full rounded-3xl border-3 border-border hover:border-primary/60 bg-card hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 group-active:scale-98">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="text-6xl sm:text-7xl p-4 rounded-2xl bg-muted/60 group-hover:bg-primary/10 transition-colors group-hover:scale-110 duration-200">
                    {topic.emoji}
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {topic.nameVi}
                    </h2>
                    <p className="text-base font-bold text-muted-foreground">
                      {topic.nameEn}
                    </p>
                  </div>

                  <Badge
                    variant="secondary"
                    className="text-sm font-semibold px-3 py-1 rounded-full bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    {count} từ vựng
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
