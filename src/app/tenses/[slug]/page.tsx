import { notFound } from "next/navigation";
import { Metadata } from "next";
import tensesCatalog from "@/data/tenses/index.json";
import presentSimpleData from "@/data/tenses/present-simple.json";
import { TenseMetadata, TenseModuleData } from "@/types/tenses";
import { TenseLessonContainer } from "@/components/tenses/TenseLessonContainer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const TENSE_DATA_MAP: Record<string, unknown> = {
  "present-simple": presentSimpleData,
};

export async function generateStaticParams() {
  const activeTenses = (tensesCatalog as TenseMetadata[]).filter(
    (tense) => tense.status === "active" && TENSE_DATA_MAP[tense.slug]
  );

  return activeTenses.map((tense) => ({
    slug: tense.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hasData = Boolean(TENSE_DATA_MAP[slug]);
  const tense = (tensesCatalog as TenseMetadata[]).find(
    (t) => t.slug === slug && t.status === "active" && hasData
  );

  if (!tense) {
    return {
      title: "Bài học không tồn tại | GameHub",
    };
  }

  return {
    title: `${tense.vietnameseName} (${tense.name}) - Luyện Ngữ Pháp Công Sở | GameHub`,
    description: tense.description,
  };
}

export default async function TenseLessonPage({ params }: PageProps) {
  const { slug } = await params;
  const rawData = TENSE_DATA_MAP[slug];

  if (!rawData) {
    notFound();
  }

  const lessonData = rawData as TenseModuleData;

  return <TenseLessonContainer lessonData={lessonData} />;
}
