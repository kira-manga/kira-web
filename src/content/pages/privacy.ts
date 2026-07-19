import { contentLink, placeholder, strong, type DocumentPageContent } from '@/content/pages/types';

export const privacyPageContent = {
  metadata: {
    title: 'Privacy policy',
    description: 'Draft privacy policy for the Kira Manga Android and iOS apps.',
    canonical: '/privacy',
  },
  hero: {
    eyebrow: 'Draft policy',
    title: 'Privacy policy',
    intro: 'This draft describes the data flows currently visible in the Kira app repository. It must be reviewed and completed by the owner before public release.',
  },
  preface: [{
    kind: 'meta',
    rows: [
      { label: 'Effective date:', value: [placeholder('[OWNER/LEGAL TO SET]')] },
      { label: 'Data controller/legal name:', value: [placeholder('[OWNER/LEGAL NAME AND ADDRESS]')] },
      { label: 'Privacy contact:', value: [placeholder('[PRIVACY EMAIL]')] },
    ],
  }],
  sections: [
    {
      id: 'device',
      number: '01',
      title: 'What Kira stores on your device',
      tocLabel: 'Data on your device',
      blocks: [
        {
          kind: 'paragraph',
          content: ['Kira stores app settings, source preferences, library entries, reading history and progress, bookmarks, download queue state, downloaded chapter files, cached images and source configuration data on your device. It also stores a randomly generated app user identifier used by the complaint feature. You choose when to create or import Kira backup ZIP files and exported manga packages.'],
        },
        {
          kind: 'paragraph',
          content: ['Cloudflare challenge cookies and per-source user-agent values may be stored locally so compatible source sites can load. These values can be site- and device-specific.'],
        },
      ],
    },
    {
      id: 'sources',
      number: '02',
      title: 'Requests to manga sources',
      tocLabel: 'Source requests',
      blocks: [{
        kind: 'paragraph',
        content: ['When you browse, search, refresh, read, or download manga, Kira sends network requests directly to the third-party source selected in the app. Those sites receive ordinary request information such as your IP address, user agent, requested URL, and any cookies required for that source. Kira does not proxy these requests through kira-backend in this release. Each source operator controls its own processing and policies.'],
      }],
    },
    {
      id: 'firebase',
      number: '03',
      title: 'Firebase services',
      blocks: [
        { kind: 'paragraph', content: ['The Android and iOS apps are configured to use Google Firebase services:'] },
        {
          kind: 'unorderedList',
          items: [
            [strong('Analytics:'), ' app/device and interaction events used to understand app operation. The iOS build uses Firebase Analytics without advertising-identifier support.'],
            [strong('Crashlytics:'), ' crash reports, stack traces, device/app diagnostics, and developer breadcrumbs needed to diagnose failures.'],
            [strong('Cloud Messaging:'), ' app-instance/push tokens and delivery information used for notifications.'],
            [strong('In-App Messaging:'), ' retrieves and displays campaigns configured in Firebase.'],
            [strong('Firestore complaints:'), ' complaint text, subject, type, status, metadata supplied by the app, creation time, and the app-generated user identifier.'],
          ],
        },
        {
          kind: 'paragraph',
          content: ["Firebase processing is subject to Google's applicable service terms and privacy documentation. Kira does not include AdMob, advertising ID permission, or an ad display surface in this release."],
        },
      ],
    },
    {
      id: 'permissions',
      number: '04',
      title: 'Photos, files, and notifications',
      tocLabel: 'Files and permissions',
      blocks: [{
        kind: 'paragraph',
        content: ['Kira requests permission to save an image to Photos only when you choose to export a page. File pickers and share sheets are used when you import or export a backup or manga package. Notification permission is used for app and download notifications. The app does not claim access beyond the platform permission and user action involved.'],
      }],
    },
    {
      title: 'Why data is used',
      blocks: [{
        kind: 'paragraph',
        content: ['The repository shows these purposes: provide reading/library/download/backup features; remember preferences and reading state; deliver notifications; diagnose crashes; measure app operation; display configured in-app messages; and submit, list, update, or delete complaints. The lawful bases and jurisdiction-specific wording must be supplied by the owner or legal reviewer: ', placeholder('[LEGAL REVIEW REQUIRED]'), '.'],
      }],
    },
    {
      id: 'retention',
      number: '05',
      title: 'Retention and deletion',
      blocks: [
        {
          kind: 'paragraph',
          content: ['Local app data remains until you delete it through app/platform controls, clear app data, or uninstall the app, subject to device backups and any exported files you keep. No verified production retention period for Firebase Analytics, Crashlytics, Messaging, In-App Messaging, or complaint documents is committed in the repository. The owner must configure and disclose those periods: ', placeholder('[OWNER TO CONFIRM FIREBASE RETENTION]'), '.'],
        },
        {
          kind: 'paragraph',
          content: ['See ', contentLink('data deletion instructions', '/data-deletion'), '. Complaint deletion and identity/authorization are still under production security review.'],
        },
      ],
    },
    {
      title: 'Sharing, sale, and transfers',
      blocks: [{
        kind: 'paragraph',
        content: ['Data is sent to selected third-party manga sources and to the Firebase services described above. The repository does not show advertising UI, an ad-serving SDK, or a sale-of-data feature. Android Analytics is configured not to collect the advertising ID and defaults ad personalization off. This statement is not a legal conclusion about “sale” or “sharing” under any jurisdiction; the owner must obtain the required review and complete any international-transfer language: ', placeholder('[LEGAL REVIEW REQUIRED]'), '.'],
      }],
    },
    {
      title: 'Children and adult content',
      blocks: [{
        kind: 'paragraph',
        content: ['Kira contains adult-content controls, but the repository does not establish a verified minimum user age, parental-consent process, or child-directed service status. Those product and legal decisions must be completed before public distribution: ', placeholder('[OWNER/LEGAL DECISION REQUIRED]'), '.'],
      }],
    },
    {
      id: 'choices',
      number: '06',
      title: 'Your choices and rights',
      blocks: [{
        kind: 'paragraph',
        content: ['You can manage permissions in system settings, remove local app data, choose which source to contact, and decide whether to submit a complaint or export files. Any statutory access, correction, objection, portability, or erasure rights depend on your location and the final controller details. Contact ', placeholder('[PRIVACY EMAIL]'), ' once supplied.'],
      }],
    },
    {
      title: 'Changes',
      blocks: [{
        kind: 'paragraph',
        content: ['Material changes will be posted on this page with an updated effective date. Store-console disclosures must be kept consistent with the shipped SDKs and behavior.'],
      }],
    },
  ],
} as const satisfies DocumentPageContent;
