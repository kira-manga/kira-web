import { contentLink, type DocumentPageContent } from '@/content/pages/types';

export const dataDeletionPageContent = {
  metadata: {
    title: 'Data deletion',
    description: 'How to remove local and submitted data from Kira Manga.',
    canonical: '/data-deletion',
  },
  hero: {
    eyebrow: 'Privacy controls',
    title: 'Delete your Kira data',
    intro: 'Kira has no app account in this release. Most library and reading data is stored locally on your device.',
  },
  preface: [{
    kind: 'meta',
    rows: [
      { label: 'Effective date:', value: ['July 1, 2026'] },
      { label: 'Privacy and deletion contact:', value: [contentLink('abdelrahmanfahmy.dev@gmail.com', 'mailto:abdelrahmanfahmy.dev@gmail.com')] },
    ],
  }],
  sections: [
    {
      id: 'accounts',
      number: '01',
      title: 'No registered account to delete',
      tocLabel: 'No accounts',
      blocks: [{
        kind: 'paragraph',
        content: ['Kira does not currently provide user accounts or account registration. There is therefore no registered Kira account, profile, or account-owned content to delete, and no account-deletion link is displayed. If accounts are added in the future, Kira will provide a direct deletion method and update these instructions before account functionality becomes available.'],
      }],
    },
    {
      id: 'local',
      number: '02',
      title: 'Delete local app data',
      tocLabel: 'Local app data',
      blocks: [
        { kind: 'subheading', text: 'Android' },
        {
          kind: 'orderedList',
          items: [
            ['Open Android Settings.'],
            ['Choose Apps → Kira Manga → Storage.'],
            ['Choose Clear storage/data, or uninstall Kira.'],
          ],
        },
        { kind: 'subheading', text: 'iPhone or iPad' },
        {
          kind: 'orderedList',
          items: [
            ['Open Settings → General → iPhone/iPad Storage → Kira Manga.'],
            ['Choose Delete App. “Offload App” may retain documents and is not equivalent.'],
          ],
        },
        {
          kind: 'paragraph',
          content: ["This removes the app's local database, settings, cache, and downloaded chapters from that device. Exact labels vary by OS version."],
        },
      ],
    },
    {
      id: 'exports',
      number: '03',
      title: 'Delete backups and exported files',
      tocLabel: 'Exported files',
      blocks: [{
        kind: 'paragraph',
        content: ['Kira backup ZIPs are created locally and saved to the destination you choose; the backup feature does not upload them to Kira servers. Exported manga packages and screenshots are also files you control outside the app sandbox. Delete them from Files, Downloads, Photos, any cloud-storage destination you selected, and any copies you shared. Removing the app does not necessarily delete those external copies.'],
      }],
    },
    {
      id: 'complaints',
      number: '04',
      title: 'Delete submitted reports',
      tocLabel: 'Submitted reports',
      blocks: [
        {
          kind: 'paragraph',
          content: ['Kira does not provide a general user-content uploading system. It does provide an optional report form. Reports you submit—including their subject, text, technical metadata, and app/device-generated identifier—are stored in Firebase Firestore so they can be investigated. Use the report screen’s delete action first where it is available.'],
        },
        {
          kind: 'notice',
          warning: true,
          content: ['If in-app deletion is unavailable, contact ', contentLink('abdelrahmanfahmy.dev@gmail.com', 'mailto:abdelrahmanfahmy.dev@gmail.com'), ' with the minimum information needed to locate the report. Do not post an installation or report identifier publicly. Additional verification may be required to avoid deleting another person’s report.'],
        },
      ],
    },
    {
      id: 'firebase',
      number: '05',
      title: 'Technical service data',
      tocLabel: 'Technical data',
      blocks: [{
        kind: 'paragraph',
        content: ['For questions or requests concerning identifiable Crashlytics, Analytics, Messaging, or In-App Messaging data, contact ', contentLink('abdelrahmanfahmy.dev@gmail.com', 'mailto:abdelrahmanfahmy.dev@gmail.com'), '. Kira has no account dashboard that can retrieve these records. Some provider records may not be linkable to you without a usable installation or report identifier. Firebase states that Crashlytics data and associated identifiers are retained for 90 days before removal begins.'],
      }],
    },
    {
      id: 'backups',
      number: '06',
      title: 'Device and cloud backups',
      tocLabel: 'Device backups',
      blocks: [{
        kind: 'paragraph',
        content: ["Android system backup rules exclude app databases, download files, and sensitive source settings in the production-preparation build. Platform or user-created backups made before that change may still exist. Kira's own exported backup files remain until you delete them."],
      }],
    },
  ],
} as const satisfies DocumentPageContent;
