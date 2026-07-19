import { ContentDocument } from '@/components/documents/content-document';
import { termsPageContent } from '@/content/pages/terms';
import { createDocumentMetadata } from '@/content/pages/types';

export const metadata = createDocumentMetadata(termsPageContent.metadata);

export default function TermsPage() {
  return <ContentDocument content={termsPageContent} />;
}
