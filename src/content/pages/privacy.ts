import { contentLink, strong, type DocumentPageContent } from '@/content/pages/types';

export const privacyPageContent = {
  metadata: {
    title: 'Privacy policy',
    description: 'Draft privacy policy for the Kira Manga Android and iOS apps.',
    canonical: '/privacy',
  },
  hero: {
    eyebrow: 'Draft policy',
    title: 'Privacy policy',
    intro: 'This draft explains how Kira handles local app data, technical service data, and information you choose to submit.',
  },
  preface: [{
    kind: 'meta',
    rows: [
      { label: 'Effective date:', value: ['July 1, 2026'] },
      { label: 'Privacy contact:', value: [contentLink('abdelrahmanfahmy.dev@gmail.com', 'mailto:abdelrahmanfahmy.dev@gmail.com')] },
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
          content: ['Kira stores app settings, source preferences, library entries, reading history and progress, bookmarks, download state, downloaded chapters, cached images, and source configuration on your device. This local information is not uploaded to Kira servers.'],
        },
        {
          kind: 'paragraph',
          content: ['Kira backup ZIP files are created locally and saved to the destination you choose through the device file picker. The backup feature does not upload them to Kira servers. A destination you select, such as a cloud-storage folder, and any operating-system service are governed by their own settings and policies.'],
        },
        {
          kind: 'paragraph',
          content: ['Cloudflare challenge cookies and per-source user-agent values may also be stored locally so compatible source sites can load. These values can be site- and device-specific.'],
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
      title: 'Technical services and reports',
      blocks: [
        { kind: 'paragraph', content: ['Kira does not currently provide user accounts or profiles. The shipping app does use the following Google Firebase services:'] },
        {
          kind: 'unorderedList',
          items: [
            [strong('Crashlytics:'), ' crash reports, stack traces, app and device diagnostics, installation identifiers, session information, and limited diagnostic breadcrumbs when a crash or recorded technical failure occurs. This information is used to diagnose problems, fix crashes, and improve stability and performance.'],
            [strong('Analytics:'), ' automatic app-measurement events and the Android app-open and manga-open events. A manga-open event can include the source identifier, manga title, and originating screen. Advertising-ID collection and ad-personalization signals are disabled in the Android configuration, and the iOS app uses the Analytics product without advertising-identifier support.'],
            [strong('Cloud Messaging:'), ' app-instance and push tokens plus delivery information used to provide notifications.'],
            [strong('In-App Messaging:'), ' app-instance and campaign interaction information needed to retrieve and display configured in-app messages.'],
            [strong('Firestore reports:'), ' when you voluntarily submit a report, Kira sends its type, subject, text, status, submission time, an app/device-generated identifier, and technical device/app metadata. Reports can be listed, updated, or deleted through supported in-app controls.'],
          ],
        },
        {
          kind: 'paragraph',
          content: ["Firebase processing is subject to Google's applicable service terms and ", contentLink('privacy documentation', 'https://firebase.google.com/support/privacy/'), '. Kira does not include an advertising SDK or ad display surface in this release.'],
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
        content: ['Local data supports reading, library, download, and backup features. Technical service data is used to deliver notifications and in-app messages, measure app operation, diagnose technical problems, fix crashes, and improve stability and performance. Information submitted in a report is used to investigate the report and take appropriate action when necessary.'],
      }],
    },
    {
      id: 'retention',
      number: '05',
      title: 'Retention and deletion',
      blocks: [
        {
          kind: 'paragraph',
          content: ['Local app data remains until you delete it through app or platform controls, clear app data, or uninstall Kira. Exported backup files remain wherever you saved or copied them until you delete those copies.'],
        },
        {
          kind: 'paragraph',
          content: ['Firebase states that Crashlytics keeps crash stack traces, related diagnostic data, and associated identifiers for 90 days before beginning removal from live and backup systems. Other Firebase data follows the configured provider settings and applicable Firebase retention processes.'],
        },
        {
          kind: 'paragraph',
          content: ['Submitted reports remain in Firestore until they are deleted through available in-app controls or handled through a supported request, subject to provider backup and security processes. See the ', contentLink('data deletion instructions', '/data-deletion'), ' or contact ', contentLink('abdelrahmanfahmy.dev@gmail.com', 'mailto:abdelrahmanfahmy.dev@gmail.com'), '.'],
        },
      ],
    },
    {
      title: 'Sharing, sale, and transfers',
      blocks: [{
        kind: 'paragraph',
        content: ['Data is sent to selected third-party manga sources and to the Firebase services described above. The application contains no sale-of-data feature, advertising UI, or ad-serving SDK. Service providers may process information in locations where they operate under their own terms and safeguards.'],
      }],
    },
    {
      title: 'Children and adult content',
      blocks: [{
        kind: 'paragraph',
        content: ['You must be at least 13 years old to use Kira. Kira uses source-specific genre and metadata blacklists and blocks titles classified as adult content from opening. Adult-oriented content is not intended to be displayed, but classification depends on information supplied by third-party sources, so the filter cannot guarantee that every inappropriate item will always be identified. Kira does not currently provide a parental-consent procedure.'],
      }],
    },
    {
      id: 'choices',
      number: '06',
      title: 'Your choices and rights',
      blocks: [{
        kind: 'paragraph',
        content: ['You can manage permissions in system settings, remove local app data, choose which source to contact, decide whether to submit a report, and decide whether to export a backup. For privacy questions or a request concerning identifiable technical or report data, contact ', contentLink('abdelrahmanfahmy.dev@gmail.com', 'mailto:abdelrahmanfahmy.dev@gmail.com'), '. Some provider records may not be linkable to you without an account or a usable installation identifier.'],
      }],
    },
    {
      id: 'accounts',
      number: '07',
      title: 'Accounts',
      blocks: [{
        kind: 'paragraph',
        content: ['Kira does not currently offer user accounts or account registration, so there is no registered Kira account to delete. If account functionality is introduced, this policy and the data-deletion page will be updated with a direct deletion method before that functionality is made available.'],
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
