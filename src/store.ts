import type { Book, BookShelf } from './types';

const STORAGE_KEY = 'bookstand_shelf';

const COVER_COLORS = [
  '#e8a0a0', '#e8c3a0', '#e8e0a0', '#b0d9a0',
  '#a0c8e8', '#b0a0e8', '#e8a0d8', '#a0e8e0',
  '#c8b89a', '#9ab8c8',
];

function createEmptyBook(id: number): Book {
  return {
    id,
    title: '',
    coverColor: COVER_COLORS[(id - 1) % COVER_COLORS.length],
    chapters: [],
    createdAt: null,
    updatedAt: null,
  };
}

export function loadShelf(): BookShelf {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BookShelf;
      // Ensure exactly 10 slots
      const shelf: BookShelf = [];
      for (let i = 1; i <= 10; i++) {
        const found = parsed.find((b) => b.id === i);
        shelf.push(found ?? createEmptyBook(i));
      }
      return shelf;
    }
  } catch {
    // ignore
  }
  return Array.from({ length: 10 }, (_, i) => createEmptyBook(i + 1));
}

export function saveShelf(shelf: BookShelf): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shelf));
}

export function exportBookAsText(book: Book): string {
  const lines: string[] = [];

  lines.push(`【${book.title || '（無題）'}】`);
  lines.push('');

  if (book.createdAt) {
    lines.push(`執筆開始日: ${new Date(book.createdAt).toLocaleString('ja-JP')}`);
  }
  if (book.updatedAt) {
    lines.push(`最終更新日: ${new Date(book.updatedAt).toLocaleString('ja-JP')}`);
  }
  if (book.createdAt || book.updatedAt) {
    lines.push('');
  }

  if (book.chapters.length === 0) {
    lines.push('（本文なし）');
  } else {
    book.chapters.forEach((ch, ci) => {
      lines.push(`■ 第${ci + 1}章  ${ch.title || '（無題）'}`);
      lines.push('');
      ch.paragraphs.forEach((p) => {
        if (p.text.trim()) {
          lines.push(p.text);
          lines.push('');
        }
      });
    });
  }

  return lines.join('\n');
}
