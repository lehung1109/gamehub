import { Metadata } from "next";
import posCatalog from "@/data/parts-of-speech/index.json";
import { PartsOfSpeechMetadata } from "@/types/parts-of-speech";
import { PartsOfSpeechHubMap } from "@/components/parts-of-speech/PartsOfSpeechHubMap";

export const metadata: Metadata = {
  title: "Parts of Speech Practice | GameHub",
  description:
    "Hệ thống luyện tập từ loại tiếng Anh thực chiến dành cho người đi làm và sinh viên. 100% miễn phí, ngữ cảnh công sở thực tế.",
};

export default function PartsOfSpeechHubPage() {
  const lessons = posCatalog as PartsOfSpeechMetadata[];

  return <PartsOfSpeechHubMap lessons={lessons} />;
}
