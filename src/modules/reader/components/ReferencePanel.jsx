import { resolveBibleReference } from '../lib/bible.js';

export function ReferencePanel({ reference, bibleData, onClose }) {
  return (
    <aside className="reference-panel" aria-label="Reference panel">
      <header>
        <div>
          <p className="eyebrow">Reference</p>
          <h2>{getReferenceTitle(reference)}</h2>
        </div>
        <button onClick={onClose}>Close</button>
      </header>

      <section className="reference-panel-section">
        {reference.type === 'scripture' ? <ScriptureReference reference={reference} bibleData={bibleData} /> : null}
        {reference.type === 'footnote' ? <FootnoteReference reference={reference} /> : null}
      </section>
    </aside>
  );
}

function ScriptureReference({ reference, bibleData }) {
  const resolved = resolveBibleReference(bibleData, reference);

  return (
    <>
      {resolved?.status === 'found' ? (
        <div className="bible-verse-list">
          {reference.sourceText ? (
            <p>{reference.sourceText}</p>
          ) : (
            resolved.verses.map(verse => (
              <p key={verse.id || verse.number}>
                <sup>{verse.number}</sup>
                {verse.text}
              </p>
            ))
          )}
          <small>{reference.sourceText ? reference.label : `${resolved.translation} · ${resolved.bookName} ${resolved.chapter}`}</small>
        </div>
      ) : (
        <p>
          {resolved?.status === 'missing-book'
            ? `${reference.book} is not available in the loaded Bible file.`
            : 'Verse text is not available for this inferred reference.'}
        </p>
      )}
    </>
  );
}

function FootnoteReference({ reference }) {
  return (
    <>
      <p className="reference-kind">Source Marker</p>
      <h3>Marker {reference.marker}</h3>
      <p>
        This marker is preserved from the source HTML. The source does not include a separate note body here yet,
        so the reader keeps it active without inventing the underlying reference.
      </p>
    </>
  );
}

function getReferenceTitle(reference) {
  if (reference.type === 'footnote') return `Marker ${reference.marker}`;
  return reference.label || 'Reference';
}
