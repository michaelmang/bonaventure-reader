import { getFootnoteMatches, getReferenceMatches } from '../lib/references.js';

export function SegmentText({ text, paragraph, allParagraphs, onNavigate, onOpenReference }) {
  if (!text) return <p className="missing-text">No text available.</p>;

  const nodes = [];
  let lastIndex = 0;
  const matches = [
    ...getFootnoteMatches(text),
    ...getReferenceMatches(text, allParagraphs)
  ].sort((a, b) => a.index - b.index || b.end - a.end);

  for (const match of matches) {
    if (match.index < lastIndex) continue;
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    nodes.push(renderMatch(match, paragraph, onNavigate, onOpenReference));
    lastIndex = match.end;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return <p>{nodes}</p>;
}

function renderMatch(match, paragraph, onNavigate, onOpenReference) {
  if (match.type === 'suppressed-marker') return null;

  if (match.type === 'document') {
    return (
      <button
        key={`${match.type}-${match.label}-${match.index}`}
        type="button"
        className="inline-reference document-reference"
        onClick={() => onNavigate(match.targetId)}
      >
        {match.raw}
      </button>
    );
  }

  return (
    <button
      key={`${match.type}-${match.label}-${match.index}`}
      type="button"
      className="inline-reference scripture-reference"
      onClick={() => onOpenReference?.({
        ...match,
        paragraphId: paragraph.id,
        paragraphNumber: paragraph.number,
        paragraph
      })}
    >
      {match.raw}
    </button>
  );
}
