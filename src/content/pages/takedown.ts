import { lineBreak, placeholder, strong, type DocumentPageContent } from '@/content/pages/types';

export const takedownPageContent = {
  metadata: {
    title: 'Copyright and takedown',
    description: 'Draft copyright and takedown process for Kira Manga.',
    canonical: '/takedown',
  },
  hero: {
    eyebrow: 'Draft policy',
    title: 'Copyright and takedown',
    intro: "Kira is a reader that sends requests to third-party source sites; it does not claim ownership of their content. This process must be adapted by legal counsel to the operator's jurisdiction.",
  },
  preface: [{
    kind: 'notice',
    warning: true,
    content: ['The repository does not establish a registered DMCA agent, legal entity, service address, or governing takedown regime. The placeholders below must be completed and legally reviewed before publication.'],
  }],
  sections: [
    {
      id: 'before',
      number: '01',
      title: 'Before submitting a notice',
      tocLabel: 'Before submitting',
      blocks: [{
        kind: 'paragraph',
        content: ["If the material is hosted by a third-party source, contacting that site's operator or hosting provider may be the direct way to remove it. A notice to Kira can be used to request that a source configuration or link be reviewed, but Kira may not control the underlying file."],
      }],
    },
    {
      id: 'include',
      number: '02',
      title: 'Information to include',
      tocLabel: 'What to include',
      blocks: [
        {
          kind: 'orderedList',
          items: [
            ['Your full legal name and a monitored email address.'],
            ['Identification of the copyrighted work or other protected material.'],
            ['The exact Kira source name and URL(s) at issue.'],
            ['A clear description of the requested action.'],
            ['The good-faith, accuracy, authority, signature, and penalty-of-perjury statements required by the law that actually applies to you and the operator, as confirmed by counsel.'],
          ],
        },
        {
          kind: 'paragraph',
          content: ['Do not send identity documents or unrelated personal information unless a verified legal process requires them.'],
        },
      ],
    },
    {
      id: 'send',
      number: '03',
      title: 'Where to send it',
      blocks: [{
        kind: 'paragraph',
        content: [
          strong('Takedown email:'), ' ', placeholder('[OWNER TO CREATE TAKEDOWN EMAIL]'), lineBreak(),
          strong('Legal name and address:'), ' ', placeholder('[OWNER/LEGAL TO SUPPLY]'), lineBreak(),
          strong('Registered agent details, if applicable:'), ' ', placeholder('[LEGAL TO CONFIRM OR MARK NOT APPLICABLE]'),
        ],
      }],
    },
    {
      id: 'review',
      number: '04',
      title: 'Review and response',
      blocks: [{
        kind: 'paragraph',
        content: ['No response deadline, counter-notice process, repeat-infringer policy, or jurisdiction-specific remedy is promised by this draft. The owner must define a staffed and lawful process before public release: ', placeholder('[LEGAL/OPERATIONS DECISION REQUIRED]'), '.'],
      }],
    },
    {
      id: 'misuse',
      number: '05',
      title: 'Misuse',
      blocks: [{
        kind: 'paragraph',
        content: ['Knowingly false or abusive notices may have legal consequences. Kira may preserve a minimal audit record where legally required, but no retention schedule is established in the repository: ', placeholder('[LEGAL RETENTION DECISION REQUIRED]'), '.'],
      }],
    },
  ],
} as const satisfies DocumentPageContent;
