import { ContentDocument } from '@/components/documents/content-document';
import { supportPageContent } from '@/content/pages/support';
import { createDocumentMetadata } from '@/content/pages/types';

export const metadata = createDocumentMetadata(supportPageContent.metadata);

export default function SupportPage() {
  return <ContentDocument content={supportPageContent} />;
}
