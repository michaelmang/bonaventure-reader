import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourceDir = '/Users/michael.mangialardi/Downloads/Bible-kjv-1611-main 2';
const outputPath = path.join(root, 'public/data/kjv-1611.json');

if (!fs.existsSync(sourceDir)) {
  if (fs.existsSync(outputPath)) {
    console.log('KJV 1611 source folder not found; keeping existing generated Bible data.');
    process.exit(0);
  }

  throw new Error(`KJV 1611 source folder not found: ${sourceDir}`);
}

const books = JSON.parse(fs.readFileSync(path.join(sourceDir, 'Books.json'), 'utf8'));
const normalizedBooks = books.map(bookName => {
  const book = JSON.parse(fs.readFileSync(path.join(sourceDir, `${bookName}.json`), 'utf8'));

  return {
    name: book.book,
    abbreviation: getAbbreviation(book.book),
    chapters: book.chapters.map(chapter => ({
      name: `${book.book} ${chapter.chapter}`,
      number: Number(chapter.chapter),
      verses: chapter.verses.map(verse => ({
        name: `${book.book} ${chapter.chapter}:${verse.verse}`,
        number: Number(verse.verse),
        text: cleanVerseText(verse.text)
      }))
    }))
  };
});

const data = {
  translation: 'KJV 1611',
  books: normalizedBooks
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Built ${normalizedBooks.length} KJV 1611 books.`);

function cleanVerseText(text = '') {
  return text
    .replace(/^¶\s*/, '')
    .replace(/&thorn;/g, 'the')
    .replace(/&#333;/g, 'on')
    .replace(/&#257;/g, 'an')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\bIesus\b/g, 'Jesus')
    .replace(/\bIohn\b/g, 'John')
    .replace(/\bIudas\b/g, 'Judas')
    .replace(/\bIudah\b/g, 'Judah')
    .replace(/\bIewes\b/g, 'Jewes')
    .replace(/\bIew\b/g, 'Jew')
    .replace(/\bIerusalem\b/g, 'Jerusalem')
    .replace(/\bIericho\b/g, 'Jericho')
    .replace(/\bIob\b/g, 'Job')
    .replace(/\bIoseph\b/g, 'Joseph')
    .replace(/\bIacob\b/g, 'Jacob')
    .replace(/\bIames\b/g, 'James')
    .replace(/\bIudge\b/g, 'Judge')
    .replace(/\bIudges\b/g, 'Judges')
    .replace(/\bIudgement\b/g, 'Judgement')
    .replace(/\biudge\b/g, 'judge')
    .replace(/\biudges\b/g, 'judges')
    .replace(/\biudgement\b/g, 'judgement')
    .replace(/\biust\b/g, 'just')
    .replace(/\biustice\b/g, 'justice')
    .replace(/\biustified\b/g, 'justified')
    .replace(/\biustifie\b/g, 'justify')
    .replace(/\biustifieth\b/g, 'justifieth')
    .replace(/\bvnto\b/g, 'unto')
    .replace(/\bvpon\b/g, 'upon')
    .replace(/\bvnder\b/g, 'under')
    .replace(/\bvpright/g, 'upright')
    .replace(/\bvngodly/g, 'ungodly')
    .replace(/\bvnrighteous/g, 'unrighteous')
    .replace(/\bvniust/g, 'unjust')
    .replace(/\bvniuers/g, 'univers')
    .replace(/\bgiue/g, 'give')
    .replace(/\bGiue/g, 'Give')
    .replace(/\bgaue\b/g, 'gave')
    .replace(/\bgiuen\b/g, 'given')
    .replace(/\bgiveth\b/g, 'giveth')
    .replace(/\bhaue\b/g, 'have')
    .replace(/\bHaue\b/g, 'Have')
    .replace(/\bhauing\b/g, 'having')
    .replace(/\bloue/g, 'love')
    .replace(/\bLoue/g, 'Love')
    .replace(/\bliue/g, 'live')
    .replace(/\bLiue/g, 'Live')
    .replace(/\bdeuill/g, 'devil')
    .replace(/\beuill/g, 'evil')
    .replace(/\beuer/g, 'ever')
    .replace(/\beuery/g, 'every')
    .replace(/\bPasseouer\b/g, 'Passover');
}

function getAbbreviation(bookName) {
  return bookName
    .replace(/^([123])\s+/, '$1 ')
    .split(/\s+/)
    .map(part => part.slice(0, part.length <= 2 ? part.length : 3))
    .join(' ');
}
