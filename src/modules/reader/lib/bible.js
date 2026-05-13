const BOOK_ALIASES = new Map([
  ['Psalm', ['Psalm', 'Psalms']],
  ['Psalms', ['Psalms', 'Psalm']],
  ['Canticles', ['Song of Solomon', 'Song of Songs', 'Canticles']],
  ['Song of Songs', ['Song of Songs', 'Song of Solomon', 'Canticles']],
  ['Sirach', ['Sirach', 'Ecclesiasticus']],
  ['Ecclesiasticus', ['Ecclesiasticus', 'Sirach']],
  ['Wisdom', ['Wisdom', 'Wisdom of Solomon']],
  ['Wisdom of Solomon', ['Wisdom of Solomon', 'Wisdom']]
]);

export function resolveBibleReference(bibleData, reference) {
  if (reference.type !== 'scripture' || !reference.chapter) return null;

  const bibles = bibleData?.bibles || (bibleData?.books ? [bibleData] : []);
  if (!bibles.length) return null;

  const results = bibles.map(bible => resolveFromBible(bible, reference));
  return results.find(result => result?.status === 'found') || results.find(Boolean) || null;
}

function resolveFromBible(bible, reference) {
  if (!bible?.books) return null;

  const bookNames = BOOK_ALIASES.get(reference.book) || [reference.book];
  const book = bible.books.find(item =>
    bookNames.some(bookName => item.name === bookName || item.abbreviation === bookName)
  );
  if (!book) return { status: 'missing-book', bookName: bookNames[0], translation: bible.translation };

  const startVerse = reference.verse || 1;
  const endVerse = reference.endVerse || reference.verse || startVerse + 4;
  const verses = getBookVerses(book).filter(verse =>
    verse.chapter === reference.chapter &&
    verse.number >= startVerse &&
    verse.number <= endVerse
  );

  return {
    status: verses.length ? 'found' : 'missing-verse',
    translation: bible.translation,
    bookName: book.name,
    chapter: reference.chapter,
    verses
  };
}

function getBookVerses(book) {
  return book.chapters.flatMap(chapter =>
    chapter.verses.map(verse => ({
      ...verse,
      chapter: Number(verse.name.match(/\s(\d+):\d+$/)?.[1] || chapter.number)
    }))
  );
}
