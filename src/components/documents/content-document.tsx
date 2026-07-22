import type { Route } from 'next';
import Link from 'next/link';
import { Fragment } from 'react';

import { DocumentPage, MetaCard, Notice } from '@/components/documents/document-page';
import { ArrowIcon, CheckIcon, SparkIcon } from '@/components/ui/icons';
import type { DocumentBlock, DocumentPageContent, RichText } from '@/content/pages/types';

function InlineContent({ content }: { content: RichText }) {
  return content.map((item, index) => {
    if (typeof item === 'string') return <Fragment key={index}>{item}</Fragment>;

    const key = `${item.kind}-${index}`;
    if (item.kind === 'break') return <br key={key} />;
    if (item.kind === 'strong') return <strong key={key}>{item.text}</strong>;
    if (item.kind === 'code') return <code key={key}>{item.text}</code>;
    if (item.href?.startsWith('/')) return <Link href={item.href as Route} key={key}>{item.text}</Link>;
    return <a href={item.href} key={key}>{item.text}</a>;
  });
}

function ContentBlock({ block }: { block: DocumentBlock }) {
  if (block.kind === 'paragraph') return <p><InlineContent content={block.content} /></p>;
  if (block.kind === 'subheading') return <h3>{block.text}</h3>;

  if (block.kind === 'orderedList' || block.kind === 'unorderedList') {
    const List = block.kind === 'orderedList' ? 'ol' : 'ul';
    return <List>{block.items.map((item, index) => <li key={index}><InlineContent content={item} /></li>)}</List>;
  }

  if (block.kind === 'notice') {
    return <Notice warning={block.warning}><InlineContent content={block.content} /></Notice>;
  }

  if (block.kind === 'meta') {
    return (
      <MetaCard>
        {block.rows.map((row, index) => (
          <Fragment key={row.label}>
            {index > 0 ? <br /> : null}<strong>{row.label}</strong> <InlineContent content={row.value} />
          </Fragment>
        ))}
      </MetaCard>
    );
  }

  if (block.kind === 'banner') {
    return (
      <div className="activationBanner">
        <span><SparkIcon /></span>
        <div><strong>{block.title}</strong><p>{block.description}</p></div>
      </div>
    );
  }

  if (block.kind === 'steps') {
    return (
      <ol className="stepList">
        {block.items.map((item) => (
          <li key={item.title}>
            <span><CheckIcon /></span>
            <div><strong>{item.title}</strong><p><InlineContent content={item.body} /></p></div>
          </li>
        ))}
      </ol>
    );
  }

  return null;
}

export function ContentDocument({ content }: { content: DocumentPageContent }) {
  const toc = content.sections.flatMap((section) => (
    section.id ? [{ href: `#${section.id}` as const, label: section.tocLabel ?? section.title }] : []
  ));

  const actions = content.hero.actions?.length ? (
    <div className="pageActions">
      {content.hero.actions.map((action) => {
        const className = `button ${action.variant === 'primary' ? 'buttonPrimary' : 'buttonGhost'}`;
        const label = <>{action.label}{action.arrow ? <> <ArrowIcon /></> : null}</>;
        return action.href.startsWith('/')
          ? <Link className={className} href={action.href as Route} key={action.href}>{label}</Link>
          : <a className={className} href={action.href} key={action.href}>{label}</a>;
      })}
    </div>
  ) : undefined;

  return (
    <DocumentPage
      eyebrow={content.hero.eyebrow}
      title={content.hero.title}
      intro={content.hero.intro}
      toc={toc}
      heroActions={actions}
    >
      {content.preface?.map((block, index) => <ContentBlock block={block} key={`preface-${index}`} />)}
      {content.sections.map((section) => (
        <section id={section.id} key={section.id ?? section.title}>
          {section.number ? <p className="sectionNumber">{section.number}</p> : null}
          <h2>{section.title}</h2>
          {section.blocks.map((block, index) => <ContentBlock block={block} key={`${section.title}-${index}`} />)}
        </section>
      ))}
      {content.afterword?.map((block, index) => <ContentBlock block={block} key={`afterword-${index}`} />)}
    </DocumentPage>
  );
}
