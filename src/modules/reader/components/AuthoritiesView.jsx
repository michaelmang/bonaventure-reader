import { getParagraphPreview, truncatePreview } from '../lib/search.js';

export function AuthoritiesView({
  authorityIndex,
  selectedAuthority,
  activeParagraph,
  onSelectAuthority,
  onNavigate,
  onBack
}) {
  const activeAuthority = selectedAuthority
    ? authorityIndex.find(authority => authority.name === selectedAuthority)
    : authorityIndex[0];

  return (
    <section className="authorities-view" aria-label="Authorities referenced">
      <header className="index-header">
        <div>
          <p className="eyebrow">Index</p>
          <h2>Authorities Referenced</h2>
          <p>
            Browse named authorities and the paragraphs where Bonaventure invokes or discusses them.
          </p>
        </div>
        <button type="button" onClick={onBack}>Back to Reader</button>
      </header>

      <div className="authorities-layout">
        <nav className="authority-browser" aria-label="Authority list">
          {authorityIndex.map(authority => (
            <button
              key={authority.name}
              type="button"
              className={activeAuthority?.name === authority.name ? 'active' : ''}
              onClick={() => onSelectAuthority(authority.name)}
            >
              <span>{authority.name}</span>
              <small>{authority.paragraphCount} paragraphs · {authority.mentionCount} mentions</small>
            </button>
          ))}
        </nav>

        <div className="authority-detail">
          {activeAuthority ? (
            <>
              <div className="authority-detail-heading">
                <div>
                  <p className="eyebrow">Authority</p>
                  <h3>{activeAuthority.name}</h3>
                </div>
                <small>{activeAuthority.paragraphCount} paragraphs</small>
              </div>

              <div className="authority-paragraphs">
                {activeAuthority.paragraphs.map(paragraph => (
                  <button
                    key={paragraph.id}
                    type="button"
                    className={paragraph.id === activeParagraph?.id ? 'active' : ''}
                    onClick={() => onNavigate(paragraph.id)}
                  >
                    <strong>
                      {paragraph.collation?.label || 'Collation'}
                      {paragraph.number ? ` · §${paragraph.number}` : ''}
                    </strong>
                    <span>{truncatePreview(getParagraphPreview(paragraph), 180)}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="empty-results">No authority selected.</p>
          )}
        </div>
      </div>
    </section>
  );
}
