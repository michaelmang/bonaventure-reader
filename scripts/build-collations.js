import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'data/raw/collations-on-the-six-days.htm');
const outputPath = path.join(root, 'public/data/collations.json');

const html = fs.readFileSync(sourcePath, 'latin1');
const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(match => match[1]);

const headings = [];
const headingStack = [];
const sections = [];
const paragraphs = [];
const divisionIntros = new Map();
const usedIds = new Set();
const HEADING_OVERRIDES = new Map([
  ['contents', 'Contents'],
  ['qualities required of hearers of the divine word, and on christ as the center of all knowledge', 'Hearers of the Divine Word and Christ the Center'],
  ['7 dimensions of peace: essence, nature, distance, doctrine, moderation, justice, concord', 'Seven Dimensions of Peace'],
  ['fullness of wisdom in which speech must end, that is: on the door of wisdom and its beauty', 'Fullness of Wisdom: Door and Beauty'],
  ['word creates a soul, is not changed, but in eternity he is saying it is to be created now', 'The Word Creates Without Being Changed'],
  ['god said to see because because he makes us see', 'God Makes Us See'],
  ['first vision, concerning the third radiation, that is the moral truth, and concerning the truth of contemplation', 'First Vision: Moral Truth and Contemplation'],
  ['first vision, concerning the first exemplary cause of the virtues, and the exemplary and cardinal virtues flowing from it', 'First Vision: Exemplary Cause of the Virtues'],
  ['first vision, concerning the threefold defect of virtues among philosophers, and, later, concerning healing, rectifying and ordinating faith', 'First Vision: Philosophers and the Healing of Faith'],
  ['second vision, that is, on understanding lifted up by faith first treatise, concerning the scope of faith', 'Second Vision: The Scope of Faith'],
  ['second vision, which is the second on the splendor of faith and deals with the vision of god\'s trinity', 'Second Vision: God\'s Trinity'],
  ['second vision, which is the third on the splendor of faith and deals with god as the exemplar of all things', 'Second Vision: God as Exemplar'],
  ['third vision, through understanding instructed by scriptures. first treatise, concerning the spiritual meanings of scriptures', 'Third Vision: Spiritual Meanings of Scripture'],
  ['third vision, which begins to deal with the sacramental figures of scripture, and then with the twelve principal mysteries pointing to christ', 'Third Vision: Sacramental Figures of Scripture'],
  ['third vision, which, continuing the preceding one, first demonstrates how the antichrist also is shown in the twelve principal mysteries', 'Third Vision: Antichrist in the Twelve Mysteries'],
  ['third vision, which continues to deal with the theories growing out of scriptures, and a certain relationship of the fruits in corresponding times', 'Third Vision: Fruits in Corresponding Times'],
  ['third vision, which is concerned with the theories of scripture signified by the fruits', 'Third Vision: Fruits and the Intellect'],
  ['third vision, which is concerned with the theories of scripture signified by the fruits, in particular how they sustain the affective dispositions.', 'Third Vision: Fruits and the Affective Dispositions'],
  ['third vision, which is concerned with the theories of scripture signified by the fruits, in particular how they sustain the affective dispositions', 'Third Vision: Fruits and the Affective Dispositions'],
  ['third vision, which is concerned with the right way and the right reason by which the fruit of scripture is perceived, that is, how wisdom is attained through knowledge and holiness.', 'Third Vision: Wisdom through Knowledge and Holiness'],
  ['third vision, which is concerned with the right way and the right reason by which the fruit of scripture is perceived, that is, how wisdom is attained through knowledge and holiness', 'Third Vision: Wisdom through Knowledge and Holiness'],
  ['fourth vision, that of understanding suspended through contemplation, the threefold object of this contemplation, that is, with the contemplation of the heavenly hierarchy, the church militant', 'Fourth Vision: Contemplation and the Heavenly Hierarchy'],
  ['fourth vision, which is particularly concerned with the first object of the intelligence suspended in contemplation, the heavenly hierarchy.', 'Fourth Vision: The Heavenly Hierarchy'],
  ['fourth vision, which is particularly concerned with the first object of the intelligence suspended in contemplation, the heavenly hierarchy', 'Fourth Vision: The Heavenly Hierarchy'],
  ['fourth vision which deals specifically with the second object of this vision, the consideration of the church militant, and also with the third', 'Fourth Vision: Church Militant and Hierarchized Soul'],
  ['fourth vision, which continues to deal with the third object of this vision, which is the hierarchized soul.', 'Fourth Vision: The Hierarchized Soul'],
  ['fourth vision, which continues to deal with the third object of this vision, which is the hierarchized soul', 'Fourth Vision: The Hierarchized Soul'],
  ['vegetation on earth is alive, generous, and lovely', 'Vegetation on Earth: Alive, Generous, Lovely'],
  ['christ is symbolized especially by means of sight, sign, word, and occurrence', 'Christ Symbolized by Sight, Sign, Word, and Occurrence'],
  ['begin with capacity to understand, with literal sense of sacred scripture', 'Begin with the Literal Sense of Sacred Scripture'],
  ['danger in original writings [of the saints]: a beauty which scripture does not have', 'Danger in Original Writings of the Saints'],
  ['still greater danger in going down to the summas of the masters', 'Danger in the Summas of the Masters'],
  ['all considerations return to christ.', 'All Considerations Return to Christ'],
  ['anyone who wishes to obtain advantages from his studies should be holy and should work', 'Study Requires Holiness and Work'],
  ['in eternal wisdom there is a principle of fecundity tending to the conceiving, the bearing and the bringing forth', 'Fecundity in Eternal Wisdom'],
  ['contemplative souls are called the daughters of jerusalem, because they are beautiful and fruitful', 'Contemplative Souls as Daughters of Jerusalem'],
  ['intellect is in darkness, for it is unable to seek since the matter transcends every power of search', 'The Intellect in Darkness'],
  ['hierarchized human mind: stars', 'Hierarchized Human Mind: Stars'],
  ['virtues correspond to:', 'Virtues Correspond To'],
  ['discerning investigation, discerning selection, judgment which is found in execution', 'Investigation, Selection, and Judgment']
]);

for (const row of rows) {
  const cells = getCells(row);
  const heading = parseHeading(row);
  const anchor = getAnchor(row);

  if (heading) {
    while (headingStack.length && headingStack.at(-1).level >= heading.level) {
      headingStack.pop();
    }

    const entry = {
      id: uniqueId(anchor || slugify(heading.text)),
      level: heading.level,
      originalLabel: heading.text,
      label: formatHeadingLabel(heading.text, heading.level),
      collation: currentCollationLabel(heading.text, headings)
    };

    headings.push(entry);
    headingStack.push(entry);
    sections.push(entry);
    continue;
  }

  if (cells.length < 2) continue;

  const english = cleanText(cells[0]);
  const latin = cleanText(cells[1]);
  if (!english && !latin) continue;
  if (isBoilerplate(english, latin)) continue;

  const number = getParagraphNumber(english) || getParagraphNumber(latin);
  const collation = currentTopHeading(headings);
  const isDivisionTitle = isDivisionTitleRow(number, english, collation);

  if (isDivisionTitle) {
    divisionIntros.set(collation.label, {
      english: stripDivisionTitle(english),
      latin: stripDivisionTitle(latin)
    });

    if (collation.label !== 'Epilogue') continue;
  }

  const sectionTrail = headingStack
    .filter(item => item.level > 1)
    .map(item => ({ level: item.level, label: item.label }));

  paragraphs.push({
    id: uniqueId(anchor || `p-${paragraphs.length + 1}`),
    sourceAnchor: anchor,
    number: isDivisionTitle ? null : number,
    english: stripEpilogueTitle(stripParagraphNumber(english)),
    latin: stripEpilogueTitle(stripParagraphNumber(latin)),
    collation,
    sectionTrail
  });
}

const collations = sections
  .filter(section => section.level === 1 && isWorkDivision(section.label))
  .map(section => {
    const label = section.label.replace(/^[IVXLCDM]+\.\s*/i, '').trim();
    const collationParagraphs = paragraphs.filter(paragraph => paragraph.collation?.label === label);

    return {
      id: section.id,
      label,
      startAnchor: collationParagraphs[0]?.id || section.id,
      description: divisionIntros.get(label)?.english || '',
      paragraphCount: collationParagraphs.length
    };
  });

const data = {
  title: 'Collations on the Six Days',
  author: 'Bonaventure',
  source: 'Collations on the Six Days.htm',
  sections,
  collations,
  paragraphs
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Built ${paragraphs.length} paragraphs across ${collations.length} collations.`);

function getCells(row) {
  return [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(match => match[1]);
}

function parseHeading(row) {
  const match = row.match(/<h([1-9])\b[^>]*>([\s\S]*?)<\/h\1>/i);
  if (!match) return null;

  return {
    level: Number(match[1]),
    text: cleanText(match[2]).replace(/\s+/g, ' ').trim()
  };
}

function formatHeadingLabel(label, level) {
  const stripped = stripOutlinePrefix(label)
    .replace(/\bPx\b/g, 'Peace')
    .replace(/\bDim\b/g, 'Dimensions')
    .replace(/\bExamplar\b/g, 'Exemplar')
    .replace(/\bOt and Nt\b/g, 'Old and New Testaments')
    .replace(/\bSs\b/g, 'Sacred Scripture')
    .replace(/\[augustine\]/i, 'Augustine')
    .replace(/\s+-\s*/g, ': ')
    .replace(/\s+/g, ' ')
    .trim();
  const structural = removeStructuralLead(stripped);

  const override = HEADING_OVERRIDES.get(stripped.toLowerCase());
  if (override) return override;
  const structuralOverride = HEADING_OVERRIDES.get(structural.toLowerCase());
  if (structuralOverride) return structuralOverride;

  if (level === 1) return structural;
  return shortenHeading(structural, level);
}

function shortenHeading(label, level) {
  const cleaned = removeStructuralLead(label)
    .replace(/\.$/, '');

  const maxLength = level <= 2 ? 86 : 72;
  if (cleaned.length <= maxLength) return cleaned;

  const clause = cleaned.split(/\s+(?:That Is|Which|Concerning|and Then|, and|, That|:)\b/i)[0].replace(/[,.;:]$/, '').trim();
  if (clause.length >= 24 && clause.length <= maxLength) return clause;

  const words = cleaned.split(/\s+/);
  let shortened = '';
  for (const word of words) {
    const next = shortened ? `${shortened} ${word}` : word;
    if (next.length > maxLength) break;
    shortened = next;
  }

  return shortened.replace(/[,.;:]$/, '').trim();
}

function removeStructuralLead(label) {
  return label
    .replace(/^On the\s+/i, '')
    .replace(/^First Treatise on the\s+/i, '')
    .replace(/^Second Treatise on the\s+/i, '')
    .replace(/^Third Treatise on the\s+/i, '')
    .replace(/^Fourth Treatise on the\s+/i, '')
    .replace(/^Fifth Treatise on the\s+/i, '')
    .replace(/^Sixth Treatise on the\s+/i, '')
    .replace(/^Seventh and Last Treatise on the\s+/i, '')
    .replace(/^Which\s+/i, 'Which ')
    .replace(/\.$/, '');
}

function stripOutlinePrefix(value = '') {
  return value.replace(/^(?:[IVXLCDM]+\.\s*|[A-Z]\.\s*|\d+[.)]\s*|[a-z]\.\s*)/i, '').trim();
}

function getAnchor(row) {
  return row.match(/<a\s+name=["']?([^"'>\s]+)["']?/i)?.[1] || '';
}

function cleanText(value = '') {
  return value
    .replace(/\$+/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-9])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&gt;/gi, '>')
    .replace(/&lt;/gi, '<')
    .replace(/&quot;/gi, '"')
    .replace(/�/g, '"')
    .replace(/\s+>\s+/g, ' ... ')
    .replace(/>/g, '')
    .replace(/(^|\s)£(?=\s|$)/g, ' ')
    .replace(/=\|\s*[^|]+\s*\|=/g, '')
    .replace(/\\+/g, '')
    .replace(/\*+/g, '')
    .replace(/\s*-\s*,/g, ',')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s*--\s*/g, ' -- ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
}

function isBoilerplate(english, latin) {
  const combined = `${english} ${latin}`.trim();
  return !combined || /^COLLATIONS ON THE SIX DAYS$/i.test(combined);
}

function isWorkDivision(label) {
  const cleanLabel = label.replace(/^[IVXLCDM]+\.\s*/i, '').trim();
  return /Collation$/i.test(cleanLabel) || /^Epilogue$/i.test(cleanLabel);
}

function getParagraphNumber(text) {
  return Number(text.match(/^(\d+)\.?\s/)?.[1]) || null;
}

function isDivisionTitleRow(number, english, collation) {
  if (!number || number < 100 || number % 100 !== 0 || !collation?.label) return false;
  if (collation.label === 'Epilogue') return /^2400\s+EPILOGUE\b/i.test(english);
  return new RegExp(`^${number}\\.?\\s*(?:[A-Z-]+\\s+COLLATION\\b)?`, 'i').test(english);
}

function stripParagraphNumber(text) {
  return text.replace(/^\d+\.?\s*/, '').trim();
}

function stripDivisionTitle(text) {
  return stripEpilogueTitle(stripParagraphNumber(text)
    .replace(/^(?:FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH|THIRTEENTH|FOURTEENTH|FIFTEENTH|SIXTEENTH|SEVENTEENTH|EIGHTEENTH|NINETEENTH|TWENTIETH|TWENTY-FIRST|TWENTY-SECOND|TWENTY-THIRD)\s+COLLATION\s*/i, '')
    .replace(/^\d+\s*/, '')
    .trim());
}

function stripEpilogueTitle(text) {
  return text.replace(/^EPILOGUE!?\s*/i, '').trim();
}

function currentTopHeading(allHeadings) {
  const heading = [...allHeadings].reverse().find(item => item.level === 1 && isWorkDivision(item.label));
  if (!heading) return null;
  return { id: heading.id, label: heading.label.replace(/^[IVXLCDM]+\.\s*/i, '').trim() };
}

function currentCollationLabel(text, allHeadings) {
  if (/Collation/i.test(text)) return text;
  return currentTopHeading(allHeadings)?.label || '';
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function uniqueId(id) {
  const fallback = id || 'entry';
  if (!usedIds.has(fallback)) {
    usedIds.add(fallback);
    return fallback;
  }

  let index = 2;
  while (usedIds.has(`${fallback}-${index}`)) index += 1;
  const nextId = `${fallback}-${index}`;
  usedIds.add(nextId);
  return nextId;
}
