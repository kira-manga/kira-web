import Link from 'next/link';

import { ArrowIcon, BackupIcon, BookIcon, CheckIcon, DownloadIcon, GlobeIcon, ShieldIcon, SlidersIcon, SparkIcon } from '@/components/icons';
import { PhoneMockup } from '@/components/phone-mockup';

const features = [
  {
    icon: BookIcon,
    title: 'A library that feels like yours',
    text: 'Save titles, follow reading progress, and return to the exact chapter you left behind.',
    className: 'featureWide featureLibrary',
  },
  {
    icon: DownloadIcon,
    title: 'Read without the signal',
    text: 'Download chapters ahead of time and keep completed downloads available offline.',
    className: 'featureDownload',
  },
  {
    icon: BackupIcon,
    title: 'Take your library with you',
    text: 'Export Kira backups and manga packages so moving devices does not mean starting over.',
    className: 'featureBackup',
  },
  {
    icon: SlidersIcon,
    title: 'A reader tuned to you',
    text: 'Shape the reading experience with practical controls built for long sessions.',
    className: 'featureReader',
  },
  {
    icon: GlobeIcon,
    title: 'Stories across languages',
    text: 'Manage the sources and languages that matter to your reading list.',
    className: 'featureWide featureLanguages',
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="homeHero shell">
        <div className="heroCopy">
          <p className="eyebrow"><span />Made for manga readers</p>
          <h1>Your next chapter is <em>already waiting.</em></h1>
          <p className="heroLead">Kira brings your library, downloads, backups, and reading tools together in one calm, focused place.</p>
          <div className="heroActions">
            <Link className="button buttonPrimary" href="/activate">Open Kira <ArrowIcon /></Link>
            <Link className="button buttonGhost" href="/#features">Explore features</Link>
          </div>
          <div className="heroProof">
            <span><CheckIcon /> Android &amp; iOS</span>
            <span><CheckIcon /> No account required</span>
            <span><CheckIcon /> Offline-friendly</span>
          </div>
        </div>
        <PhoneMockup />
      </section>

      <section className="capabilityStrip" aria-label="Kira capabilities">
        <div className="shell capabilityTrack">
          <span><BookIcon /> Local library</span><i />
          <span><DownloadIcon /> Offline chapters</span><i />
          <span><BackupIcon /> Portable backups</span><i />
          <span><GlobeIcon /> Multilingual sources</span>
        </div>
      </section>

      <section className="section shell" id="features">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow"><span />Everything in its place</p>
            <h2>Less managing.<br /><em>More reading.</em></h2>
          </div>
          <p>Kira stays out of the way while keeping the essentials close—your progress, your downloads, and your library.</p>
        </div>
        <div className="featureGrid">
          {features.map(({ icon: Icon, title, text, className }) => (
            <article className={`featureCard ${className}`} key={title}>
              <span className="featureIcon"><Icon /></span>
              <div className="featureText"><h3>{title}</h3><p>{text}</p></div>
              {className.includes('featureLibrary') && (
                <div className="miniStack" aria-hidden="true"><span /><span /><span /><span /></div>
              )}
              {className.includes('featureLanguages') && (
                <div className="languageCloud" aria-hidden="true"><span>EN</span><span>AR</span><span>ES</span><span>PT</span><span>DE</span></div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="readerSection">
        <div className="shell readerGrid">
          <div className="readerCopy">
            <p className="eyebrow"><span />Designed around the story</p>
            <h2>A reader that knows when to <em>disappear.</em></h2>
            <p>Controls stay close when you need them and fade into the background when you do not. The page gets the spotlight.</p>
            <ul className="checkList">
              <li><CheckIcon /> Continue from your saved progress</li>
              <li><CheckIcon /> Keep completed chapters offline</li>
              <li><CheckIcon /> Tune the experience to your reading style</li>
            </ul>
            <Link className="textLink" href="/guide">See how Kira works <ArrowIcon /></Link>
          </div>
          <div className="readerDemo" aria-hidden="true">
            <div className="mangaPage pageBack"><span /></div>
            <div className="mangaPage pageFront">
              <div className="panel panelOne"><span className="speedLines" /></div>
              <div className="panel panelTwo"><span /></div>
              <div className="panel panelThree"><i /><i /><i /></div>
              <div className="readerChrome"><span>‹</span><strong>18 / 24</strong><span>•••</span></div>
            </div>
            <div className="tapHint"><SparkIcon /> Focus mode</div>
          </div>
        </div>
      </section>

      <section className="section shell stepsSection">
        <div className="sectionHeading compactHeading">
          <div><p className="eyebrow"><span />Start in minutes</p><h2>From install to <em>chapter one.</em></h2></div>
        </div>
        <div className="stepsGrid">
          <article><span>01</span><h3>Open the official link</h3><p>Visit the activation page on the Android or iOS device where Kira is installed.</p></article>
          <article><span>02</span><h3>Choose your sources</h3><p>Kira reveals source management so you can enable the options you want to use.</p></article>
          <article><span>03</span><h3>Build your library</h3><p>Find a title, add it to your library, and download chapters when you want them offline.</p></article>
        </div>
      </section>

      <section className="trustSection shell">
        <div className="trustIcon"><ShieldIcon /></div>
        <div><p className="eyebrow"><span />Your device, your library</p><h2>Local by default.<br /><em>Portable by choice.</em></h2></div>
        <div className="trustCopy"><p>Your library and reading state live on your device. Export a Kira backup when you want to keep a portable copy.</p><Link className="textLink" href="/privacy">Read the privacy policy <ArrowIcon /></Link></div>
      </section>

      <section className="finalCta shell">
        <div className="ctaGlow" />
        <SparkIcon className="ctaSpark ctaSparkOne" />
        <SparkIcon className="ctaSpark ctaSparkTwo" />
        <p className="eyebrow"><span />The next page is yours</p>
        <h2>Make room for<br /><em>one more chapter.</em></h2>
        <p>Open Kira on your phone and continue where you left off.</p>
        <Link className="button buttonLight" href="/activate">Start reading <ArrowIcon /></Link>
      </section>
    </>
  );
}
