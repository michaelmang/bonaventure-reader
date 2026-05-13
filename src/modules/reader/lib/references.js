const FOOTNOTE_PATTERN = /=\|(\d+)\|=/g;
const BOOK_PATTERNS = [
  ['Genesis', /\bGenesis\s+(\d+)(?::\s*(\d+)(?:[-–](\d+))?)?/gi],
  ['Exodus', /\bExodus\s+(\d+)(?::\s*(\d+)(?:[-–](\d+))?)?/gi],
  ['Psalms', /\bPsalm(?:s)?\s+(\d+)(?::\s*(\d+)(?:[-–](\d+))?)?/gi],
  ['Isaiah', /\bIsaiah\s+(\d+)(?::\s*(\d+)(?:[-–](\d+))?)?/gi],
  ['Matthew', /\bMatthew\s+(\d+)(?::\s*(\d+)(?:[-–](\d+))?)?/gi],
  ['John', /\bJohn\s+(\d+)(?::\s*(\d+)(?:[-–](\d+))?)?/gi],
  ['Romans', /\bRomans\s+(\d+)(?::\s*(\d+)(?:[-–](\d+))?)?/gi],
  ['1 Corinthians', /\b1\s+Corinthians\s+(\d+)(?::\s*(\d+)(?:[-–](\d+))?)?/gi],
  ['2 Corinthians', /\b2\s+Corinthians\s+(\d+)(?::\s*(\d+)(?:[-–](\d+))?)?/gi],
  ['1 Timothy', /\b1\s+Timothy\s+(\d+)(?::\s*(\d+)(?:[-–](\d+))?)?/gi],
  ['James', /\bJames\s+(\d+)(?::\s*(\d+)(?:[-–](\d+))?)?/gi],
  ['Revelation', /\bRevelation\s+(\d+)(?::\s*(\d+)(?:[-–](\d+))?)?/gi]
];

const LATIN_BOOKS = [
  ['Sirach', /\bEcclesiastici\s+([a-z]+(?:\s+[a-z]+)?)/gi],
  ['Matthew', /\bMatthaei\s+([a-z]+(?:\s+[a-z]+)?)/gi],
  ['John', /\bIoannis\s+([a-z]+(?:\s+[a-z]+)?)/gi],
  ['Isaiah', /\bIsaiae\s+([a-z]+(?:\s+[a-z]+)?)/gi],
  ['1 Timothy', /\bprima\s+ad\s+Timotheum\b/gi],
  ['Psalms', /\bin\s+Psalmo\b|\bPsalmo\b/gi]
];

const LATIN_NUMBERS = new Map([
  ['primo', 1],
  ['secundo', 2],
  ['tertio', 3],
  ['quarto', 4],
  ['quinto', 5],
  ['sexto', 6],
  ['septimo', 7],
  ['octavo', 8],
  ['nono', 9],
  ['decimo', 10],
  ['undecimo', 11],
  ['duodecimo', 12],
  ['tertio decimo', 13],
  ['decimo tertio', 13],
  ['quarto decimo', 14],
  ['decimo quarto', 14],
  ['quinto decimo', 15],
  ['decimo quinto', 15]
]);

const PHRASE_REFERENCES = [
  {
    pattern: /\bIn the midst of the Church\s+(?:the Lord\s+|she\s+)?shall open his mouth\b|\bIn medio Ecclesiae aperiet os eius\b/gi,
    book: 'Sirach',
    chapter: 15,
    verse: 5
  },
  {
    pattern: /\bThe sons of wisdom are the Church of the just:?\s+and their generation, obedience and love\b|\bFilii sapientiae ecclesia iustorum,?\s+et natio illorum obedientia et dilectio\b/gi,
    book: 'Sirach',
    chapter: 3,
    verse: 1,
    sourceText: 'The sons of wisdom are the Church of the just: and their generation, obedience and love.'
  },
  {
    pattern: /\bwith Thee is my praise in a great Church\b|\bApud te laus mea in ecclesia magna\b/gi,
    book: 'Psalms',
    chapter: 22,
    verse: 25
  },
  {
    pattern: /\bBless the Lord, you of Israel's wellspring\b|\bIn ecclesiis benedicite Deo domino de fontibus Israel\b/gi,
    book: 'Psalms',
    chapter: 68,
    verse: 26
  },
  {
    pattern: /\bI will proclaim your name to my brethren;?\s+in the midst of the assembly I will praise you\b|\bNarrabo nomen tuum fratribus meis, in medio,? ecclesiae laudabo te\b/gi,
    book: 'Psalms',
    chapter: 22,
    verse: 22
  },
  {
    pattern: /\bOpen wide your mouth,? and I will fill it\b|\bAperi os tuum, et ego adimplebo illud\b/gi,
    book: 'Psalms',
    chapter: 81,
    verse: 10
  },
  {
    pattern: /\bTeach me goodness and discipline and knowledge\.?|\bbonitatem et disciplinam et scientiam doce me\.?/gi,
    book: 'Psalms',
    chapter: 119,
    verse: 66,
    sourceText: 'Teach me goodness and discipline and knowledge.'
  },
  {
    pattern: /\bSon,? if thou desire wisdom,? keep justice\b|\bFili, concupiscens sapientiam conserva iustitiam\b/gi,
    book: 'Sirach',
    chapter: 1,
    verse: 33,
    sourceText: 'Son, if thou desire wisdom, keep justice: and God will give her to thee.'
  },
  {
    pattern: /\bTo whom hath the root of wisdom been revealed\b|\bRadix sapientiae cui revelata est\b/gi,
    book: 'Sirach',
    chapter: 1,
    verse: 6
  },
  {
    pattern: /\bHe created her in the Holy Ghost,? and saw her,? and numbered her,? and measured her\b|\bIpse creavit illam in Spiritu sancto et vidit et dinumeravit et dimensus est\b/gi,
    book: 'Sirach',
    chapter: 1,
    verse: 9
  },
  {
    pattern: /\bHeavens height,? earth's breadth,? the depth of the abyss\b|\bAltitudinem caeli et latitudinem terrae et profundum abyssi\b/gi,
    book: 'Sirach',
    chapter: 1,
    verse: 3
  },
  {
    pattern: /\bIn the highest heavens did I dwell\b|\bEgo in altissimis habito\b/gi,
    book: 'Sirach',
    chapter: 24,
    verse: 4
  },
  {
    pattern: /\bLet us now praise men of renown\b|\bLaudemus viros gloriosos\b/gi,
    book: 'Sirach',
    chapter: 44,
    verse: 1
  },
  {
    pattern: /\bThe sun,? three times as much,? burneth the mountains\b|\bTripliciter sol exurens montes\b/gi,
    book: 'Sirach',
    chapter: 43,
    verse: 4
  },
  {
    pattern: /\bThe firmament on high is His beauty\b|\bAltitudinis firmamentum species caeli\b/gi,
    book: 'Sirach',
    chapter: 43,
    verse: 1
  },
  {
    pattern: /\bThe beauty,? the glory of the heavens are the stars\b|\bSpecies caeli, gloria stellarum\b/gi,
    book: 'Sirach',
    chapter: 43,
    verse: 9
  },
  {
    pattern: /\bAs arrows in the hand of the mighty,? so the children of them that have been shaken\b|\bSicut sagittae in manu potentis, ita filii excussorum\b/gi,
    book: 'Psalms',
    chapter: 127,
    verse: 4
  },
  {
    pattern: /\bThe place of your fathers your sons shall have\b|\bPro patribus tuis nati sunt tibi filii\b/gi,
    book: 'Psalms',
    chapter: 45,
    verse: 16
  },
  {
    pattern: /\bO Lord,? all my desire is before You\b|\bDomine,,? ante te omne desiderium meum\b/gi,
    book: 'Psalms',
    chapter: 38,
    verse: 9
  },
  {
    pattern: /\bThe Lord is King,? in splendor robed\b|\bDominus regnavit, decorem indutus est\b/gi,
    book: 'Psalms',
    chapter: 93,
    verse: 1
  },
  {
    pattern: /["“]\s*I write these things to thee, my son Timothy,?\.{0,3}\s+in order that thou mayest know\.{0,3}\s+how to conduct thyself in the house of God,?\s+which is the Church of the living God,?\s+the pillar and mainstay of the truth\.?|\bHaec tibi scribo\.{0,3}\s+fili Timothee, ut scias, quomodo oporteat te conversari in domo Dei,?\s+quae est Ecclesia Dei vivi,?\s+columna et firmamentum veritatis\.?/gi,
    book: '1 Timothy',
    chapter: 3,
    verse: 14,
    endVerse: 15,
    closeQuote: true,
    sourceText: '"I write these things to thee, my son Timothy,... in order that thou mayest know... how to conduct thyself in the house of God, which is the Church of the living God, the pillar and mainstay of the truth."'
  },
  {
    pattern: /\bthe purpose of this charge is charity,? or love,? from a pure heart and a good conscience and faith unfeigned\b|\bFinis praecepti est dilectio seu caritas de corde puro et conscientia bona et fide non ficta\b/gi,
    book: '1 Timothy',
    chapter: 1,
    verse: 5
  },
  {
    pattern: /\bhe who loves his neighbor has fulfilled the Law\b|\bQui diligit proximum legem implevit\b/gi,
    book: 'Romans',
    chapter: 13,
    verse: 8
  },
  {
    pattern: /\bGod is a God of peace,? not of disorder\b|\bNon est Deus dissensionis, sed pacis\b/gi,
    book: '1 Corinthians',
    chapter: 14,
    verse: 33
  },
  {
    pattern: /\bOn these two commandments depend the whole Law and the Prophets\b|\bIn his, inquit, duobus universa lex pendet et Prophetae\b/gi,
    book: 'Matthew',
    chapter: 22,
    verse: 40
  },
  {
    pattern: /\bBy this will all men know that you are My disciples,? if you have love for one another\b|\bIn hoc cognoscent omnes, quia discipuli mei estis, si dilectionem habueritis ad invicem\b/gi,
    book: 'John',
    chapter: 13,
    verse: 35
  },
  {
    pattern: /\bTo me,? the very least of all saints,? there was given this grace\b|\bMihi omnium Sanctorum minimo data est haec gratia\b/gi,
    book: 'Ephesians',
    chapter: 3,
    verse: 8,
    endVerse: 10
  },
  {
    pattern: /\bI would not have you ignorant,? brethren,? that our fathers were all under the cloud\b|\bNolo, vos ignorare, fratres, quoniam patres nostri omnes sub nube fuerunt\b/gi,
    book: '1 Corinthians',
    chapter: 10,
    verse: 1,
    endVerse: 4
  },
  {
    pattern: /\bAbraham had two sons,? the one by a slave-girl and the other by a free woman\b|\bAbraham duos filios habuit, unum de ancilla et unum de libera\b/gi,
    book: 'Galatians',
    chapter: 4,
    verse: 22,
    endVerse: 24
  },
  {
    pattern: /\bWisdom,? however,? we speak among those who are mature\b|\bSapientiam loquimur inter perfectos\b/gi,
    book: '1 Corinthians',
    chapter: 2,
    verse: 6,
    endVerse: 10
  },
  {
    pattern: /\bbeing rooted and grounded in love,? you may be able to comprehend\b|\bIn caritate,? radicati et fundati,? ut possitis comprehendere\b/gi,
    book: 'Ephesians',
    chapter: 3,
    verse: 17,
    endVerse: 19
  },
  {
    pattern: /\bMediator between God and men\b|\bmediator Dei et hominum\b/gi,
    book: '1 Timothy',
    chapter: 2,
    verse: 5
  },
  {
    pattern: /\bno one knows the Son except the Father\b|\bnemo novit Filium nisi Pater\b/gi,
    book: 'Matthew',
    chapter: 11,
    verse: 27
  },
  {
    pattern: /\bIn the beginning God created the heavens and the earth\b|\bIn principio creavit Deus caelum et terram\b/gi,
    book: 'Genesis',
    chapter: 1,
    verse: 1
  },
  {
    pattern: /\bIn the beginning was the Word\b|\bIn principio erat Verbum\b/gi,
    book: 'John',
    chapter: 1,
    verse: 1,
    endVerse: 3
  },
  {
    pattern: /\bMedius vestrum stetit\b/gi,
    book: 'John',
    chapter: 1,
    verse: 26
  },
  {
    pattern: /\bQui misit me baptizare in aqua\b/gi,
    book: 'John',
    chapter: 1,
    verse: 33
  },
  {
    pattern: /\bFor since the creation of the world His invisible attributes are clearly seen\b|\bInvisibilia Dei a creatura mundi per ea quae facta sunt intellecta conspiciuntur\b/gi,
    book: 'Romans',
    chapter: 1,
    verse: 20
  },
  {
    pattern: /\bBy faith we understand that the world was fashioned by the Word of God\b|\bFide intelligimus, aptata esse saecula Verbo Dei\b/gi,
    book: 'Hebrews',
    chapter: 11,
    verse: 3
  },
  {
    pattern: /\bThe Word was made flesh,? and dwelt\b|\bVerbum caro factum est et habitavit\b/gi,
    book: 'John',
    chapter: 1,
    verse: 14
  },
  {
    pattern: /\bthe end of the Law is Christ\b|\bFinis Legis est Christus\b/gi,
    book: 'Romans',
    chapter: 10,
    verse: 4
  },
  {
    pattern: /\bGod,? who at sundry times and in divers manners spoke\b|\bMultifariam multisque modis olim Deus loquens\b/gi,
    book: 'Hebrews',
    chapter: 1,
    verse: 1,
    endVerse: 4
  },
  {
    pattern: /\bthe Word of God (?:is )?living and effectual\b|\bVivus est sermo Dei et efficax\b/gi,
    book: 'Hebrews',
    chapter: 4,
    verse: 12,
    endVerse: 13
  },
  {
    pattern: /\bwe have not a High Priest that cannot have compassion\b|\bNon habemus Pontificem, qui non possit compati\b/gi,
    book: 'Hebrews',
    chapter: 4,
    verse: 15
  },
  {
    pattern: /\bsuch a High Priest,? holy,? innocent,? undefiled\b|\bTalis decebat, ut esset nobis pontifex, sanctus, innocens, impollutus\b/gi,
    book: 'Hebrews',
    chapter: 7,
    verse: 26
  },
  {
    pattern: /\bI know a man in Christ who fourteen years ago\b|\bScio hominem ante annos quatuordecim\b/gi,
    book: '2 Corinthians',
    chapter: 12,
    verse: 2,
    endVerse: 4
  },
  {
    pattern: /\byou were once darkness,? now light in the Lord\b|\bEratis enim aliquando tenebrae, nunc autem lux in Domino\b/gi,
    book: 'Ephesians',
    chapter: 5,
    verse: 8
  },
  {
    pattern: /\bthe farmer who toils must be the first to partake of the fruit\b|\blaborantem agricolam oportet prius edere de fructibus\b/gi,
    book: '2 Timothy',
    chapter: 2,
    verse: 6
  },
  {
    pattern: /\bif the earthly house in which we dwell be destroyed\b|\bsi terrestris domus nostra huius habitationis dissolvatur\b/gi,
    book: '2 Corinthians',
    chapter: 5,
    verse: 1
  },
  {
    pattern: /\bIt is good to make steadfast the heart by grace\b|\bOptimum est gratia stabilire cor\b/gi,
    book: 'Hebrews',
    chapter: 13,
    verse: 9
  },
  {
    pattern: /\bthe fruit of the Spirit is charity,? joy,? peace\b|\bFructus autem spiritus est caritas, gaudium, pax\b/gi,
    book: 'Galatians',
    chapter: 5,
    verse: 22,
    endVerse: 23
  },
  {
    pattern: /\bthe Spirit pleads for us are unutterable\b|\bgemitus sunt inenarrabili quibus postulat pro nobis Spiritus\b/gi,
    book: 'Romans',
    chapter: 8,
    verse: 26
  },
  {
    pattern: /\bThe law indeed is holy and the commandment holy and just and good\b|\bLex sancta, et mandatum sanctum et iustum et pium\b/gi,
    book: 'Romans',
    chapter: 7,
    verse: 12
  },
  {
    pattern: /\bHe who was wont to steal,? let him steal no longer\b|\bQui furabatur iam non furetur\b/gi,
    book: 'Ephesians',
    chapter: 4,
    verse: 28
  },
  {
    pattern: /\bWe may live temperately and justly and piously in this world\b|\bSobrie, pie et iuste vivamus in hoc saeculo\b/gi,
    book: 'Titus',
    chapter: 2,
    verse: 12
  },
  {
    pattern: /\bthat Jerusalem which is above\b|\bsuperna Ierusalem\b/gi,
    book: 'Galatians',
    chapter: 4,
    verse: 26
  },
  {
    pattern: /\byou are now no longer strangers\b|\bIam non estis hospites et advenae\b/gi,
    book: 'Ephesians',
    chapter: 2,
    verse: 19,
    endVerse: 20
  },
  {
    pattern: /\bwere sealed with the Holy Spirit of the promise\b|\bSignati estis spiritu adoptionis\b/gi,
    book: 'Ephesians',
    chapter: 1,
    verse: 13
  },
  {
    pattern: /\bThe sure foundation of God stands firm\b|\bFirmum fundamentum Dei stat\b/gi,
    book: '2 Timothy',
    chapter: 2,
    verse: 19
  }
];

export function getFootnoteMatches(text = '') {
  return [...text.matchAll(FOOTNOTE_PATTERN)].map(match => ({
    type: 'suppressed-marker',
    index: match.index,
    end: match.index + match[0].length,
    marker: match[1],
    label: `Source marker ${match[1]}`
  }));
}

export function getReferenceMatches(text = '', paragraphs = []) {
  return [
    ...getScriptureMatches(text),
    ...getDocumentCrossReferenceMatches(text, paragraphs)
  ].sort((a, b) => a.index - b.index || b.end - a.end);
}

export function getParagraphReferences(paragraph, paragraphs = []) {
  const refs = [
    ...getReferenceMatches(paragraph.english, paragraphs),
    ...getReferenceMatches(paragraph.latin, paragraphs)
  ];
  const unique = new Map();

  for (const ref of refs) {
    const key = getReferenceKey(ref);
    const existing = unique.get(key);
    if (!existing || isMorePreciseReference(ref, existing)) unique.set(key, ref);
  }

  return [...unique.values()];
}

function getScriptureMatches(text) {
  const matches = [];

  for (const phrase of PHRASE_REFERENCES) {
    for (const match of text.matchAll(phrase.pattern)) {
      const shouldCloseQuote = phrase.closeQuote && /^["“]/.test(match[0]);
      matches.push({
        type: 'scripture',
        index: match.index,
        end: match.index + match[0].length,
        label: `${phrase.book} ${phrase.chapter}:${phrase.verse}${phrase.endVerse ? `-${phrase.endVerse}` : ''}`,
        book: phrase.book,
        chapter: phrase.chapter,
        verse: phrase.verse,
        endVerse: phrase.endVerse,
        sourceText: phrase.sourceText,
        inferred: true,
        raw: shouldCloseQuote ? `${match[0].replace(/\.*$/, '.')}"` : match[0]
      });
    }
  }

  for (const [book, pattern] of BOOK_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      matches.push(toScriptureMatch(match, book));
    }
  }

  for (const [book, pattern] of LATIN_BOOKS) {
    for (const match of text.matchAll(pattern)) {
      const chapter = match[1] ? LATIN_NUMBERS.get(match[1].toLowerCase()) : null;
      if (!chapter) continue;
      matches.push({
        type: 'scripture',
        index: match.index,
        end: match.index + match[0].length,
        label: chapter ? `${book} ${chapter}` : book,
        book,
        chapter,
        verse: null,
        inferred: true,
        raw: match[0]
      });
    }
  }

  return removeLessPreciseScripture(removeOverlaps(matches));
}

function getReferenceKey(ref) {
  if (ref.type === 'scripture') {
    return `${ref.type}:${ref.book}:${ref.chapter}:${ref.targetId || ''}`;
  }

  return `${ref.type}:${ref.label}:${ref.targetId || ''}`;
}

function isMorePreciseReference(candidate, existing) {
  if (candidate.type !== 'scripture' || existing.type !== 'scripture') return false;
  if (candidate.verse && !existing.verse) return true;
  if (candidate.endVerse && !existing.endVerse) return true;
  return false;
}

function toScriptureMatch(match, book) {
  const [, chapter, verse, endVerse] = match;
  return {
    type: 'scripture',
    index: match.index,
    end: match.index + match[0].length,
    label: `${book} ${chapter}${verse ? `:${verse}${endVerse ? `-${endVerse}` : ''}` : ''}`,
    book,
    chapter: Number(chapter),
    verse: verse ? Number(verse) : null,
    endVerse: endVerse ? Number(endVerse) : null,
    inferred: false,
    raw: match[0]
  };
}

function getDocumentCrossReferenceMatches(text, paragraphs) {
  const matches = [];
  const collationPattern = /\b(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth|Thirteenth|Fourteenth|Fifteenth|Sixteenth|Seventeenth|Eighteenth|Nineteenth|Twentieth|Twenty-first|Twenty-second|Twenty-third)\s+Collation\b/gi;

  for (const match of text.matchAll(collationPattern)) {
    const target = paragraphs.find(paragraph => paragraph.collation?.label === match[0]);
    if (!target) continue;
    matches.push({
      type: 'document',
      index: match.index,
      end: match.index + match[0].length,
      label: match[0],
      targetId: target.id,
      raw: match[0]
    });
  }

  return matches;
}

function removeOverlaps(matches) {
  const sorted = matches.sort((a, b) => a.index - b.index || b.end - a.end);
  const accepted = [];
  let cursor = -1;

  for (const match of sorted) {
    if (match.index < cursor) continue;
    accepted.push(match);
    cursor = match.end;
  }

  return accepted;
}

function removeLessPreciseScripture(matches) {
  const preciseKeys = new Set(
    matches
      .filter(match => match.type === 'scripture' && match.verse)
      .map(match => `${match.book}:${match.chapter}`)
  );

  return matches.filter(match => {
    if (match.type !== 'scripture' || match.verse) return true;
    return !preciseKeys.has(`${match.book}:${match.chapter}`);
  });
}
