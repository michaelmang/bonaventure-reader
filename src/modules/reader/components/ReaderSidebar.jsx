import { getParagraphPreview, truncatePreview } from '../lib/search.js';

export function ReaderSidebar({
  data,
  activeParagraph,
  filteredParagraphs,
  authorityIndex,
  activeView,
  outline,
  collapsedCollationIds,
  query,
  onQueryChange,
  onNavigate,
  onOpenAuthorities,
  onToggleCollation
}) {
  const showingSearchResults = query.trim().length > 0;

  return (
    <aside className="reader-sidebar">
      <div className="sidebar-search">
        <input
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder="Search English or Latin..."
          aria-label="Search English or Latin"
        />
      </div>

      {showingSearchResults ? (
        <ParagraphList
          paragraphs={filteredParagraphs}
          activeParagraph={activeParagraph}
          onNavigate={onNavigate}
        />
      ) : null}

      <div className="sidebar-index-links">
        <button
          type="button"
          className={activeView === 'authorities' ? 'active' : ''}
          onClick={onOpenAuthorities}
        >
          <span>Authorities</span>
          <small>{authorityIndex.length} indexed</small>
        </button>
      </div>

      <nav className="collation-list" aria-label="Collations">
        {data.collations.map(collation => {
          const active = activeParagraph?.collation?.id === collation.id;
          const collapsed = collapsedCollationIds.has(collation.id);

          return (
            <div key={collation.id} className="collation-group">
              <button
                className={[active ? 'active' : '', active && collapsed ? 'collapsed' : ''].filter(Boolean).join(' ')}
                aria-expanded={active ? !collapsed : undefined}
                onClick={() => {
                  if (active) {
                    onToggleCollation(collation.id);
                  } else {
                    onNavigate(collation.startAnchor);
                  }
                }}
              >
                <span>{collation.label}</span>
                <small>{collation.paragraphCount} paragraphs</small>
              </button>
              {active && !collapsed ? (
                <OutlineList
                  outline={outline}
                  activeParagraph={activeParagraph}
                  onNavigate={onNavigate}
                />
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function OutlineList({ outline, activeParagraph, onNavigate }) {
  return (
    <div className="outline-list" aria-label="Active collation outline">
      {outline.map(group => (
        <section key={group.label} className="outline-group">
          <button
            className="outline-heading"
            onClick={() => onNavigate(group.paragraphs[0].id)}
          >
            <span>{group.label}</span>
            <small>{group.paragraphs.length}</small>
          </button>
          <div className="outline-paragraphs">
            {group.paragraphs.map(paragraph => (
              <button
                key={paragraph.id}
                className={paragraph.id === activeParagraph?.id ? 'active' : ''}
                onClick={() => onNavigate(paragraph.id)}
              >
                <strong>{paragraph.number ? `§${paragraph.number}` : 'Section'}</strong>
                <span>{truncatePreview(getParagraphPreview(paragraph), 74)}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ParagraphList({ paragraphs, activeParagraph, onNavigate, label = 'Search Results' }) {
  return (
    <div className="paragraph-list search-results-list" aria-label="Search results">
      <div className="search-results-heading">
        <span>{label}</span>
        <small>{paragraphs.length}</small>
      </div>
      {!paragraphs.length ? (
        <p className="empty-results">No matching paragraphs.</p>
      ) : null}
      {paragraphs.map(paragraph => (
        <button
          key={paragraph.id}
          className={paragraph.id === activeParagraph?.id ? 'active' : ''}
          onClick={() => onNavigate(paragraph.id)}
        >
          <strong>{paragraph.number ? `§${paragraph.number}` : 'Section'}</strong>
          <span>{truncatePreview(getParagraphPreview(paragraph), 92)}</span>
        </button>
      ))}
    </div>
  );
}
