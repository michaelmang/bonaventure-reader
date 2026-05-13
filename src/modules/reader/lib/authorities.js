const AUTHORITY_PATTERNS = [
  {
    name: 'Aristotle',
    patterns: [
      /\bAristotle\b/gi,
      /\bthe Philosopher\b/gi,
      /\bPhilosophus\b/gi
    ]
  },
  {
    name: 'Apostle Paul',
    patterns: [
      /\bSt\.?\s+Paul\b/gi,
      /\bSaint\s+Paul\b/gi,
      /\bPaul says\b/gi,
      /\bPaul\b/gi,
      /\bPaulus\b/gi
    ]
  },
  {
    name: 'Dionysius',
    patterns: [/\bDionysius\b/gi, /\bDionysius\b/gi]
  },
  {
    name: 'Augustine',
    patterns: [/\bAugustine\b/gi, /\bAugustinus\b/gi]
  },
  {
    name: 'Gregory',
    patterns: [/\bGregory\b/gi, /\bGregorius\b/gi]
  },
  {
    name: 'Jerome',
    patterns: [/\bJerome\b/gi, /\bHieronymus\b/gi]
  },
  {
    name: 'Bernard',
    patterns: [/\bBernard\b/gi, /\bBernardus\b/gi]
  },
  {
    name: 'Boethius',
    patterns: [/\bBoethius\b/gi]
  },
  {
    name: 'Plato',
    patterns: [/\bPlato\b/gi, /\bPlato[nm]\b/gi]
  },
  {
    name: 'Anselm',
    patterns: [/\bAnselm\b/gi, /\bAnselmus\b/gi]
  },
  {
    name: 'Hugh of St. Victor',
    patterns: [/\bHugh(?:\s+of\s+St\.?\s+Victor)?\b/gi, /\bHugo\b/gi]
  },
  {
    name: 'Richard of St. Victor',
    patterns: [/\bRichard(?:\s+of\s+St\.?\s+Victor)?\b/gi, /\bRichardus\b/gi]
  },
  {
    name: 'John Damascene',
    patterns: [/\bDamascene\b/gi, /\bDamascenus\b/gi]
  },
  {
    name: 'Origen',
    patterns: [/\bOrigen\b/gi, /\bOrigenes\b/gi]
  },
  {
    name: 'Seneca',
    patterns: [/\bSeneca\b/gi]
  },
  {
    name: 'Avicenna',
    patterns: [/\bAvicenna\b/gi]
  },
  {
    name: 'Averroes',
    patterns: [/\bAverroes\b/gi]
  },
  {
    name: 'Moses',
    patterns: [/\bMoses\b/gi, /\bMoyses\b/gi]
  },
  {
    name: 'David',
    patterns: [/\bDavid\b/gi]
  },
  {
    name: 'Solomon',
    patterns: [/\bSolomon\b/gi, /\bSalomon\b/gi]
  },
  {
    name: 'Isaiah',
    patterns: [/\bIsaiah\b/gi, /\bIsaias\b/gi, /\bIsaiae\b/gi]
  },
  {
    name: 'Matthew',
    patterns: [/\bMatthew\b/gi, /\bMatthaeus\b/gi, /\bMatthaei\b/gi]
  },
  {
    name: 'John',
    patterns: [/\bJohn\b/gi, /\bIoannes\b/gi, /\bIoannis\b/gi]
  }
];

export function getParagraphAuthorities(paragraph) {
  const english = paragraph?.english || '';
  const latin = paragraph?.latin || '';

  return AUTHORITY_PATTERNS.map(authority => {
    const englishCount = countAuthorityMentions(english, authority.patterns);
    const latinCount = countAuthorityMentions(latin, authority.patterns);
    const count = Math.max(englishCount, latinCount);

    return count ? { name: authority.name, count } : null;
  }).filter(Boolean);
}

export function buildAuthorityIndex(paragraphs) {
  const index = new Map();

  for (const paragraph of paragraphs) {
    for (const authority of getParagraphAuthorities(paragraph)) {
      const entry = index.get(authority.name) || {
        name: authority.name,
        paragraphCount: 0,
        mentionCount: 0,
        paragraphs: []
      };

      entry.paragraphCount += 1;
      entry.mentionCount += authority.count;
      entry.paragraphs.push(paragraph);
      index.set(authority.name, entry);
    }
  }

  return [...index.values()].sort((first, second) =>
    second.paragraphCount - first.paragraphCount || first.name.localeCompare(second.name)
  );
}

function countAuthorityMentions(text, patterns) {
  const ranges = [];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      ranges.push([match.index, match.index + match[0].length]);
    }
  }

  const uniqueRanges = [];
  for (const [start, end] of ranges.sort((first, second) => first[0] - second[0] || second[1] - first[1])) {
    if (uniqueRanges.some(([uniqueStart, uniqueEnd]) => start >= uniqueStart && end <= uniqueEnd)) continue;
    uniqueRanges.push([start, end]);
  }

  return uniqueRanges.length;
}
