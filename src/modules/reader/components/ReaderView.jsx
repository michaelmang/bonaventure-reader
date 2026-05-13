import { SegmentText } from './SegmentText.jsx';
import { getParagraphReferences } from '../lib/references.js';
import { getParagraphAuthorities } from '../lib/authorities.js';

const READING_MODES = [
  { id: 'english', label: 'English' },
  { id: 'latin', label: 'Latin' },
  { id: 'parallel', label: 'Parallel' }
];

export function ReaderView({
  allParagraphs,
  paragraph,
  previous,
  next,
  mode,
  onModeChange,
  onNavigate,
  onOpenReference,
  onBackToTop
}) {
  if (!paragraph) return null;
  const paragraphReferences = getParagraphReferences(paragraph, allParagraphs);
  const paragraphAuthorities = getParagraphAuthorities(paragraph);
  const heading = getHeadingDisplay(paragraph);

  return (
    <article className="reader-article">
      <div className="article-toolbar">
        <div className="mode-toggle" aria-label="Reading mode">
          {READING_MODES.map(option => (
            <button
              key={option.id}
              className={mode === option.id ? 'active' : ''}
              onClick={() => onModeChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="article-nav">
          <button disabled={!previous} onClick={() => previous && onNavigate(previous.id)}>Prev</button>
          <button disabled={!next} onClick={() => next && onNavigate(next.id)}>Next</button>
        </div>
      </div>

      <header className="article-header">
        <p className="eyebrow">{paragraph.collation?.label || 'Collations'}</p>
        <h2>{heading.title}</h2>
        {heading.subtitle ? <p className="article-subtitle">{heading.subtitle}</p> : null}
        <p className="paragraph-locator">{paragraph.number ? `Paragraph ${paragraph.number}` : 'Section'}</p>
      </header>

      {paragraphReferences.length ? (
        <ReferenceSummary
          references={paragraphReferences}
          onNavigate={onNavigate}
          onOpenReference={onOpenReference}
          paragraph={paragraph}
        />
      ) : null}

      {paragraphAuthorities.length ? (
        <AuthoritySummary authorities={paragraphAuthorities} />
      ) : null}

      <ReadingText
        allParagraphs={allParagraphs}
        paragraph={paragraph}
        mode={mode}
        onNavigate={onNavigate}
        onOpenReference={onOpenReference}
      />

      <footer className="reader-footer-nav">
        <button disabled={!previous} onClick={() => previous && onNavigate(previous.id)}>Prev</button>
        <button onClick={onBackToTop}>Back to top</button>
        <button disabled={!next} onClick={() => next && onNavigate(next.id)}>Next</button>
      </footer>
    </article>
  );
}

function AuthoritySummary({ authorities }) {
  return (
    <section className="paragraph-authority-summary" aria-label="Authorities referenced">
      <h3>Authorities</h3>
      <div>
        {authorities.map(authority => (
          <span key={authority.name}>
            {authority.name}
            {authority.count > 1 ? <small> {authority.count}</small> : null}
          </span>
        ))}
      </div>
    </section>
  );
}

function getHeadingDisplay(paragraph) {
  const trail = paragraph.sectionTrail || [];
  const title = trail[0]?.label || paragraph.collation?.label || 'Collations on the Six Days';
  const subtitle = trail.length > 1 ? trail.at(-1).label : '';

  return {
    title: stripOutlinePrefix(title),
    subtitle: stripOutlinePrefix(subtitle)
  };
}

function stripOutlinePrefix(value = '') {
  return value.replace(/^(?:[A-Z]\.|\d+\.|[a-z]\.|\d+\))\s*/i, '').trim();
}

function ReferenceSummary({ references, onNavigate, onOpenReference, paragraph }) {
  return (
    <section className="paragraph-reference-summary" aria-label="Paragraph references">
      <h3>References</h3>
      <div>
        {references.map((reference, index) => (
          <button
            key={`${reference.type}-${reference.label}-${index}`}
            type="button"
            className={reference.type === 'document' ? 'document-reference-chip' : ''}
            onClick={() => {
              if (reference.type === 'document') {
                onNavigate(reference.targetId);
              } else {
                onOpenReference?.({
                  ...reference,
                  paragraphId: paragraph.id,
                  paragraphNumber: paragraph.number,
                  paragraph
                });
              }
            }}
          >
            {reference.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function ReadingText({ allParagraphs, paragraph, mode, onNavigate, onOpenReference }) {
  if (mode === 'parallel') {
    return (
      <div className="parallel-reading">
        <section>
          <h3>English</h3>
          <SegmentText
            text={paragraph.english}
            paragraph={paragraph}
            allParagraphs={allParagraphs}
            onNavigate={onNavigate}
            onOpenReference={onOpenReference}
          />
        </section>
        <section>
          <h3>Latin</h3>
          <SegmentText
            text={paragraph.latin}
            paragraph={paragraph}
            allParagraphs={allParagraphs}
            onNavigate={onNavigate}
            onOpenReference={onOpenReference}
          />
        </section>
      </div>
    );
  }

  return (
    <section className="single-reading">
      <SegmentText
        text={mode === 'latin' ? paragraph.latin : paragraph.english}
        paragraph={paragraph}
        allParagraphs={allParagraphs}
        onNavigate={onNavigate}
        onOpenReference={onOpenReference}
      />
    </section>
  );
}
