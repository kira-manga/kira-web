import { placeholder, type DocumentPageContent } from '@/content/pages/types';

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
  sections: [
    {
      id: 'local',
      number: '01',
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
      number: '02',
      title: 'Delete exported files',
      tocLabel: 'Exported files',
      blocks: [{
        kind: 'paragraph',
        content: ['Kira backup ZIPs, exported manga packages, and saved screenshots are files you control outside the app sandbox. Delete them from Files, Downloads, Photos, cloud storage, and any copies you shared. Removing the app does not necessarily delete those external copies.'],
      }],
    },
    {
      id: 'complaints',
      number: '03',
      title: 'Delete complaints',
      tocLabel: 'Complaints',
      blocks: [
        {
          kind: 'paragraph',
          content: ["The complaint feature can list and delete complaint documents associated with the app-generated user identifier where the current client path and Firestore rules permit it. During internal testing, use the complaint screen's delete action first."],
        },
        {
          kind: 'notice',
          warning: true,
          content: ['If that is unavailable, contact ', placeholder('[PRIVACY/SUPPORT EMAIL]'), ' with the minimum information needed to locate the complaint. Do not post the identifier publicly. A verified identity and authorization process is not yet implemented, so complaint deletion requests and rules are a blocker before public release.'],
        },
      ],
    },
    {
      id: 'firebase',
      number: '04',
      title: 'Firebase diagnostics and analytics',
      tocLabel: 'Firebase records',
      blocks: [{
        kind: 'paragraph',
        content: ["The repository does not provide an app-account dashboard that can retrieve or erase a specific person's Analytics, Crashlytics, Messaging, or In-App Messaging records. The owner must configure retention and a legally reviewed request process using Firebase/Google tooling where applicable: ", placeholder('[OWNER TO DOCUMENT PROCESS AND RETENTION]'), '.'],
      }],
    },
    {
      id: 'backups',
      number: '05',
      title: 'Device and cloud backups',
      tocLabel: 'Device backups',
      blocks: [{
        kind: 'paragraph',
        content: ["Android system backup rules exclude app databases, download files, and sensitive source settings in the production-preparation build. Platform or user-created backups made before that change may still exist. Kira's own exported backup files remain until you delete them."],
      }],
    },
  ],
} as const satisfies DocumentPageContent;
