import { ContentDocument } from '@/components/documents/content-document';
import { activatePageContent } from '@/content/pages/activate';
import { createDocumentMetadata } from '@/content/pages/types';

export const metadata = createDocumentMetadata(activatePageContent.metadata);

export default function ActivatePage() {
  return <ContentDocument content={activatePageContent} />;
}
