import { ContentDocument } from '@/components/documents/content-document';
import { privacyPageContent } from '@/content/pages/privacy';
import { createDocumentMetadata } from '@/content/pages/types';

export const metadata = createDocumentMetadata(privacyPageContent.metadata);

export default function PrivacyPage() {
  return <ContentDocument content={privacyPageContent} />;
}
