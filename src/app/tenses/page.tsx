import { Metadata } from "next";
import tensesCatalog from "@/data/tenses/index.json";
import { TenseMetadata } from "@/types/tenses";
import { TenseHubMap } from "@/components/tenses/TenseHubMap";

export const metadata: Metadata = {
  title: "Bản Đồ 12 Thì Tiếng Anh Cho Người Đi Làm | GameHub",
  description:
    "Hệ thống luyện tập 12 thì tiếng Anh thực chiến dành cho người đi làm và sinh viên. 100% miễn phí, ngữ cảnh công sở thực tế.",
};

import { Container } from "@/components/ui/container";

export default function TensesHubPage() {
  const tenses = tensesCatalog as TenseMetadata[];

  return (
    <Container>
      <TenseHubMap tenses={tenses} />
    </Container>
  );
}
