import { useMemo, useRef, useState } from 'react';
import { filterParagraphs } from '../lib/search.js';
import { getCollationOutline } from '../lib/outline.js';
import { buildAuthorityIndex } from '../lib/authorities.js';
import { useBible } from '../hooks/useBible.js';
import { useReaderRoute } from '../hooks/useReaderRoute.js';
import { AuthoritiesView } from './AuthoritiesView.jsx';
import { ReferencePanel } from './ReferencePanel.jsx';
import { ReaderSidebar } from './ReaderSidebar.jsx';
import { ReaderView } from './ReaderView.jsx';
import './reader.css';

export function ReaderShell({ data }) {
  const contentRef = useRef(null);
  const [query, setQuery] = useState('');
  const [reference, setReference] = useState(null);
  const [selectedAuthority, setSelectedAuthority] = useState(null);
  const [collapsedCollationIds, setCollapsedCollationIds] = useState(() => new Set());
  const { data: bibleData } = useBible();
  const { paragraphId, mode, view, navigate, changeMode, changeView } = useReaderRoute(data.paragraphs);
  const filteredParagraphs = useMemo(
    () => filterParagraphs(data.paragraphs, query),
    [data.paragraphs, query]
  );
  const activeParagraph = data.paragraphs.find(paragraph => paragraph.id === paragraphId) || data.paragraphs[0];
  const outline = useMemo(
    () => getCollationOutline(data, activeParagraph),
    [data, activeParagraph]
  );
  const authorityIndex = useMemo(
    () => buildAuthorityIndex(data.paragraphs),
    [data.paragraphs]
  );
  const activeIndex = data.paragraphs.findIndex(paragraph => paragraph.id === activeParagraph?.id);
  const previous = activeIndex > 0 ? data.paragraphs[activeIndex - 1] : null;
  const next = activeIndex < data.paragraphs.length - 1 ? data.paragraphs[activeIndex + 1] : null;

  function handleNavigate(id) {
    navigate(id);
    const targetParagraph = data.paragraphs.find(paragraph => paragraph.id === id);
    if (targetParagraph?.collation?.id) {
      setCollapsedCollationIds(previousIds => {
        if (!previousIds.has(targetParagraph.collation.id)) return previousIds;
        const nextIds = new Set(previousIds);
        nextIds.delete(targetParagraph.collation.id);
        return nextIds;
      });
    }
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenAuthorities() {
    if (!selectedAuthority && authorityIndex[0]) setSelectedAuthority(authorityIndex[0].name);
    changeView('authorities');
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleToggleCollation(collationId) {
    setCollapsedCollationIds(previousIds => {
      const nextIds = new Set(previousIds);
      if (nextIds.has(collationId)) {
        nextIds.delete(collationId);
      } else {
        nextIds.add(collationId);
      }
      return nextIds;
    });
  }

  return (
    <div className="reader-shell">
      <header className="reader-topbar">
        <button className="brand-mark" onClick={() => handleNavigate(data.paragraphs[0].id)} aria-label="Open beginning">
          <img src="/favicon-32x32.png" alt="" />
        </button>
        <div>
          <h1>The Seraphic Reader</h1>
          <p>Collations on the Six Days</p>
        </div>
        <a className="flagship-link" href="https://neo-summa.vercel.app/" target="_blank" rel="noreferrer">
          Neo Summa Reader
        </a>
      </header>

      <ReaderSidebar
        data={data}
        activeParagraph={activeParagraph}
        filteredParagraphs={filteredParagraphs}
        authorityIndex={authorityIndex}
        activeView={view}
        outline={outline}
        collapsedCollationIds={collapsedCollationIds}
        query={query}
        onQueryChange={setQuery}
        onNavigate={handleNavigate}
        onOpenAuthorities={handleOpenAuthorities}
        onToggleCollation={handleToggleCollation}
      />

      <main className={`reader-main ${reference ? 'with-reference-panel' : ''}`} ref={contentRef}>
        {view === 'authorities' ? (
          <AuthoritiesView
            authorityIndex={authorityIndex}
            selectedAuthority={selectedAuthority}
            activeParagraph={activeParagraph}
            onSelectAuthority={setSelectedAuthority}
            onNavigate={handleNavigate}
            onBack={() => changeView('reader')}
          />
        ) : (
          <ReaderView
            allParagraphs={data.paragraphs}
            paragraph={activeParagraph}
            previous={previous}
            next={next}
            mode={mode}
            onModeChange={changeMode}
            onNavigate={handleNavigate}
            onOpenReference={setReference}
            onBackToTop={() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          />
        )}
      </main>

      {reference ? (
        <ReferencePanel
          reference={reference}
          paragraphs={data.paragraphs}
          bibleData={bibleData}
          onClose={() => setReference(null)}
          onNavigate={handleNavigate}
        />
      ) : null}
    </div>
  );
}
