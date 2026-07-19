import type { Metadata } from 'next';
import Link from 'next/link';

import { DocumentPage, MetaCard } from '@/components/document-page';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'Draft privacy policy for the Kira Manga Android and iOS apps.',
  alternates: { canonical: '/privacy' },
};

const toc = [
  { href: '#device', label: 'Data on your device' },
  { href: '#sources', label: 'Source requests' },
  { href: '#firebase', label: 'Firebase services' },
  { href: '#permissions', label: 'Files and permissions' },
  { href: '#retention', label: 'Retention and deletion' },
  { href: '#choices', label: 'Your choices and rights' },
] as const;

export default function PrivacyPage() {
  return (
    <DocumentPage eyebrow="Draft policy" title="Privacy policy" intro="This draft describes the data flows currently visible in the Kira app repository. It must be reviewed and completed by the owner before public release." toc={toc}>
      <MetaCard><strong>Effective date:</strong> <span className="placeholder">[OWNER/LEGAL TO SET]</span><br /><strong>Data controller/legal name:</strong> <span className="placeholder">[OWNER/LEGAL NAME AND ADDRESS]</span><br /><strong>Privacy contact:</strong> <span className="placeholder">[PRIVACY EMAIL]</span></MetaCard>
      <section id="device"><p className="sectionNumber">01</p><h2>What Kira stores on your device</h2><p>Kira stores app settings, source preferences, library entries, reading history and progress, bookmarks, download queue state, downloaded chapter files, cached images and source configuration data on your device. It also stores a randomly generated app user identifier used by the complaint feature. You choose when to create or import Kira backup ZIP files and exported manga packages.</p><p>Cloudflare challenge cookies and per-source user-agent values may be stored locally so compatible source sites can load. These values can be site- and device-specific.</p></section>
      <section id="sources"><p className="sectionNumber">02</p><h2>Requests to manga sources</h2><p>When you browse, search, refresh, read, or download manga, Kira sends network requests directly to the third-party source selected in the app. Those sites receive ordinary request information such as your IP address, user agent, requested URL, and any cookies required for that source. Kira does not proxy these requests through kira-backend in this release. Each source operator controls its own processing and policies.</p></section>
      <section id="firebase"><p className="sectionNumber">03</p><h2>Firebase services</h2><p>The Android and iOS apps are configured to use Google Firebase services:</p><ul><li><strong>Analytics:</strong> app/device and interaction events used to understand app operation. The iOS build uses Firebase Analytics without advertising-identifier support.</li><li><strong>Crashlytics:</strong> crash reports, stack traces, device/app diagnostics, and developer breadcrumbs needed to diagnose failures.</li><li><strong>Cloud Messaging:</strong> app-instance/push tokens and delivery information used for notifications.</li><li><strong>In-App Messaging:</strong> retrieves and displays campaigns configured in Firebase.</li><li><strong>Firestore complaints:</strong> complaint text, subject, type, status, metadata supplied by the app, creation time, and the app-generated user identifier.</li></ul><p>Firebase processing is subject to Google&apos;s applicable service terms and privacy documentation. Kira does not include AdMob, advertising ID permission, or an ad display surface in this release.</p></section>
      <section id="permissions"><p className="sectionNumber">04</p><h2>Photos, files, and notifications</h2><p>Kira requests permission to save an image to Photos only when you choose to export a page. File pickers and share sheets are used when you import or export a backup or manga package. Notification permission is used for app and download notifications. The app does not claim access beyond the platform permission and user action involved.</p></section>
      <section><h2>Why data is used</h2><p>The repository shows these purposes: provide reading/library/download/backup features; remember preferences and reading state; deliver notifications; diagnose crashes; measure app operation; display configured in-app messages; and submit, list, update, or delete complaints. The lawful bases and jurisdiction-specific wording must be supplied by the owner or legal reviewer: <span className="placeholder">[LEGAL REVIEW REQUIRED]</span>.</p></section>
      <section id="retention"><p className="sectionNumber">05</p><h2>Retention and deletion</h2><p>Local app data remains until you delete it through app/platform controls, clear app data, or uninstall the app, subject to device backups and any exported files you keep. No verified production retention period for Firebase Analytics, Crashlytics, Messaging, In-App Messaging, or complaint documents is committed in the repository. The owner must configure and disclose those periods: <span className="placeholder">[OWNER TO CONFIRM FIREBASE RETENTION]</span>.</p><p>See <Link href="/data-deletion">data deletion instructions</Link>. Complaint deletion and identity/authorization are still under production security review.</p></section>
      <section><h2>Sharing, sale, and transfers</h2><p>Data is sent to selected third-party manga sources and to the Firebase services described above. The repository does not show advertising UI, an ad-serving SDK, or a sale-of-data feature. Android Analytics is configured not to collect the advertising ID and defaults ad personalization off. This statement is not a legal conclusion about “sale” or “sharing” under any jurisdiction; the owner must obtain the required review and complete any international-transfer language: <span className="placeholder">[LEGAL REVIEW REQUIRED]</span>.</p></section>
      <section><h2>Children and adult content</h2><p>Kira contains adult-content controls, but the repository does not establish a verified minimum user age, parental-consent process, or child-directed service status. Those product and legal decisions must be completed before public distribution: <span className="placeholder">[OWNER/LEGAL DECISION REQUIRED]</span>.</p></section>
      <section id="choices"><p className="sectionNumber">06</p><h2>Your choices and rights</h2><p>You can manage permissions in system settings, remove local app data, choose which source to contact, and decide whether to submit a complaint or export files. Any statutory access, correction, objection, portability, or erasure rights depend on your location and the final controller details. Contact <span className="placeholder">[PRIVACY EMAIL]</span> once supplied.</p></section>
      <section><h2>Changes</h2><p>Material changes will be posted on this page with an updated effective date. Store-console disclosures must be kept consistent with the shipped SDKs and behavior.</p></section>
    </DocumentPage>
  );
}
