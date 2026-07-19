import type { Metadata } from 'next';

import { DocumentPage, Notice } from '@/components/document-page';

export const metadata: Metadata = {
  title: 'Data deletion',
  description: 'How to remove local and submitted data from Kira Manga.',
  alternates: { canonical: '/data-deletion' },
};

const toc = [
  { href: '#local', label: 'Local app data' },
  { href: '#exports', label: 'Exported files' },
  { href: '#complaints', label: 'Complaints' },
  { href: '#firebase', label: 'Firebase records' },
  { href: '#backups', label: 'Device backups' },
] as const;

export default function DataDeletionPage() {
  return (
    <DocumentPage eyebrow="Privacy controls" title="Delete your Kira data" intro="Kira has no app account in this release. Most library and reading data is stored locally on your device." toc={toc}>
      <section id="local"><p className="sectionNumber">01</p><h2>Delete local app data</h2><h3>Android</h3><ol><li>Open Android Settings.</li><li>Choose Apps → Kira Manga → Storage.</li><li>Choose Clear storage/data, or uninstall Kira.</li></ol><h3>iPhone or iPad</h3><ol><li>Open Settings → General → iPhone/iPad Storage → Kira Manga.</li><li>Choose Delete App. “Offload App” may retain documents and is not equivalent.</li></ol><p>This removes the app&apos;s local database, settings, cache, and downloaded chapters from that device. Exact labels vary by OS version.</p></section>
      <section id="exports"><p className="sectionNumber">02</p><h2>Delete exported files</h2><p>Kira backup ZIPs, exported manga packages, and saved screenshots are files you control outside the app sandbox. Delete them from Files, Downloads, Photos, cloud storage, and any copies you shared. Removing the app does not necessarily delete those external copies.</p></section>
      <section id="complaints"><p className="sectionNumber">03</p><h2>Delete complaints</h2><p>The complaint feature can list and delete complaint documents associated with the app-generated user identifier where the current client path and Firestore rules permit it. During internal testing, use the complaint screen&apos;s delete action first.</p><Notice warning>If that is unavailable, contact <span className="placeholder">[PRIVACY/SUPPORT EMAIL]</span> with the minimum information needed to locate the complaint. Do not post the identifier publicly. A verified identity and authorization process is not yet implemented, so complaint deletion requests and rules are a blocker before public release.</Notice></section>
      <section id="firebase"><p className="sectionNumber">04</p><h2>Firebase diagnostics and analytics</h2><p>The repository does not provide an app-account dashboard that can retrieve or erase a specific person&apos;s Analytics, Crashlytics, Messaging, or In-App Messaging records. The owner must configure retention and a legally reviewed request process using Firebase/Google tooling where applicable: <span className="placeholder">[OWNER TO DOCUMENT PROCESS AND RETENTION]</span>.</p></section>
      <section id="backups"><p className="sectionNumber">05</p><h2>Device and cloud backups</h2><p>Android system backup rules exclude app databases, download files, and sensitive source settings in the production-preparation build. Platform or user-created backups made before that change may still exist. Kira&apos;s own exported backup files remain until you delete them.</p></section>
    </DocumentPage>
  );
}
