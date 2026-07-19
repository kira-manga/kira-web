import { ContentDocument } from '@/components/documents/content-document';
import { guidePageContent } from '@/content/pages/guide';
import { createDocumentMetadata } from '@/content/pages/types';

export const metadata = createDocumentMetadata(guidePageContent.metadata);

export default function GuidePage() {
  return <ContentDocument content={guidePageContent} />;
}
