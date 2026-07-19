import { ContentDocument } from '@/components/documents/content-document';
import { takedownPageContent } from '@/content/pages/takedown';
import { createDocumentMetadata } from '@/content/pages/types';

export const metadata = createDocumentMetadata(takedownPageContent.metadata);

export default function TakedownPage() {
  return <ContentDocument content={takedownPageContent} />;
}
