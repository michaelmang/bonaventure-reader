export function filterParagraphs(paragraphs, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return paragraphs;

  return paragraphs.filter(paragraph => [
    paragraph.number,
    paragraph.english,
    paragraph.latin,
    paragraph.collation?.label,
    ...(paragraph.sectionTrail || []).map(section => section.label)
  ].join(' ').toLowerCase().includes(normalizedQuery));
}

export function getParagraphPreview(paragraph) {
  return paragraph.english || paragraph.latin || '';
}

export function truncatePreview(value = '', maxLength = 80) {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;

  const trimmed = text.slice(0, maxLength + 1);
  const lastSpace = trimmed.lastIndexOf(' ');
  const clipped = lastSpace > 24 ? trimmed.slice(0, lastSpace) : text.slice(0, maxLength);

  return `${clipped.replace(/[.,;:!?-]+$/, '')}...`;
}
