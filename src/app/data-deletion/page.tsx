import { ContentDocument } from '@/components/documents/content-document';
import { dataDeletionPageContent } from '@/content/pages/data-deletion';
import { createDocumentMetadata } from '@/content/pages/types';

export const metadata = createDocumentMetadata(dataDeletionPageContent.metadata);

export default function DataDeletionPage() {
  return <ContentDocument content={dataDeletionPageContent} />;
}
