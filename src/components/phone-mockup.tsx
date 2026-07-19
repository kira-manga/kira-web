import { BookIcon, DownloadIcon, GlobeIcon, SparkIcon } from '@/components/icons';

const books = [
  { title: 'Night Signal', chapter: 'Ch. 48', cover: 'coverOne' },
  { title: 'Paper Moon', chapter: 'Ch. 17', cover: 'coverTwo' },
  { title: 'Zero Hour', chapter: 'Ch. 92', cover: 'coverThree' },
] as const;

export function PhoneMockup() {
  return (
    <div className="visualStage" aria-hidden="true">
      <div className="orbit orbitOne" />
      <div className="orbit orbitTwo" />
      <div className="floatingCard syncCard">
        <span className="floatingIcon"><DownloadIcon /></span>
        <span><strong>12 chapters</strong><small>Ready offline</small></span>
      </div>
      <div className="phone">
        <div className="phoneTop"><span>9:41</span><span className="phoneSensor" /><span>•••</span></div>
        <div className="phoneContent">
          <div className="appHeading">
            <div><small>Good evening</small><strong>Your library</strong></div>
            <span className="avatar">K</span>
          </div>
          <div className="filterRow"><span className="active">All</span><span>Unread</span><span>Downloaded</span></div>
          <div className="continueCard">
            <div className="miniCover" />
            <div><small>Continue reading</small><strong>Falling Stars</strong><span>Chapter 31 · 68%</span></div>
            <span className="playButton">›</span>
          </div>
          <div className="shelfHeading"><strong>Recently updated</strong><span>See all</span></div>
          <div className="bookGrid">
            {books.map((book) => (
              <div className="book" key={book.title}>
                <div className={`bookCover ${book.cover}`}><span /></div>
                <strong>{book.title}</strong><small>{book.chapter}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="phoneNav">
          <span className="active"><BookIcon /><small>Library</small></span>
          <span><SparkIcon /><small>Browse</small></span>
          <span><GlobeIcon /><small>Sources</small></span>
        </div>
      </div>
      <div className="floatingCard readerCard">
        <span className="readerProgress"><i /></span>
        <span><strong>Page 18 of 24</strong><small>Tap to continue</small></span>
      </div>
    </div>
  );
}
