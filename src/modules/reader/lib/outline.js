export function getCollationOutline(data, activeParagraph) {
  const activeCollation = activeParagraph?.collation;
  if (!activeCollation) return [];

  const collationParagraphs = data.paragraphs.filter(paragraph =>
    paragraph.collation?.label === activeCollation.label
  );
  const groups = new Map();

  for (const paragraph of collationParagraphs) {
    const section = getPrimarySection(paragraph);
    const key = section?.label || activeCollation.label;

    if (!groups.has(key)) {
      groups.set(key, {
        label: key,
        level: section?.level || 1,
        paragraphs: []
      });
    }

    groups.get(key).paragraphs.push(paragraph);
  }

  return [...groups.values()];
}

export function getPrimarySection(paragraph) {
  const trail = paragraph?.sectionTrail || [];
  return [...trail].reverse().find(section => section.level >= 2 && section.level <= 4) || trail.at(-1);
}
