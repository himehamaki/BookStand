import type { BookShelf } from '../types';

interface Props {
  shelf: BookShelf;
  onSelect: (id: number) => void;
}

export default function BookShelfView({ shelf, onSelect }: Props) {
  return (
    <div className="shelf-container">
      <h1 className="shelf-title">📚 BookStand</h1>
      <p className="shelf-subtitle">本棚から本を選んで執筆を始めましょう</p>
      <div className="shelf-grid">
        {shelf.map((book) => {
          const hasContent = book.title || book.chapters.length > 0;
          return (
            <button
              key={book.id}
              className={`book-spine${hasContent ? ' book-spine--written' : ''}`}
              style={{ backgroundColor: book.coverColor }}
              onClick={() => onSelect(book.id)}
              title={book.title || `本 ${book.id}`}
              aria-label={`本 ${book.id}: ${book.title || '（未執筆）'}`}
            >
              <span className="book-number">{book.id}</span>
              <span className="book-label">
                {book.title || '（未執筆）'}
              </span>
              {book.updatedAt && (
                <span className="book-date">
                  {new Date(book.updatedAt).toLocaleDateString('ja-JP')}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="shelf-hint">全 10 冊 · クリックして編集</p>
    </div>
  );
}
