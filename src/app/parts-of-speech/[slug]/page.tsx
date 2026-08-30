import { notFound } from "next/navigation";
import { PartsOfSpeechLessonContainer } from "@/components/parts-of-speech/PartsOfSpeechLessonContainer";
import { PartsOfSpeechModuleData } from "@/types/parts-of-speech";

// Define a type for the params, which Next.js provides to dynamic routes
type Props = {
  params: Promise<{ slug: string }>;
};

// In Next.js 15, route segment configs are standard and we can generate static params
export async function generateStaticParams() {
  const catalog = (await import("@/data/parts-of-speech/index.json")).default;
  return catalog.map((lesson) => ({
    slug: lesson.slug,
  }));
}

export default async function PartsOfSpeechLessonPage({ params }: Props) {
  // Extract slug from params. In Next.js 15 App Router, `params` is a Promise and must be awaited.
  const { slug } = await params;

  let lessonData: PartsOfSpeechModuleData;
  try {
    // Dynamic import based on slug
    lessonData = (await import(`@/data/parts-of-speech/${slug}.json`)).default;
  } catch {
    // If the json file does not exist, return 404
    notFound();
  }

  return <PartsOfSpeechLessonContainer lessonData={lessonData} />;
}
