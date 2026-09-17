import { chapters } from '../content/site';

type ChapterNavProps = {
  activeSection: string;
};

export default function ChapterNav({ activeSection }: ChapterNavProps) {
  return (
    <nav className="chapter-nav" aria-label="Page sections">
      {chapters.map((chapter) => (
        <a className={activeSection === chapter.key ? 'active' : ''} href={chapter.href} key={chapter.key}>
          <span className="chapter-dot" />
          <span className="chapter-label">{chapter.label}</span>
        </a>
      ))}
    </nav>
  );
}
