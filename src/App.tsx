import { useState, useCallback } from 'react';
import BookShelfView from './components/BookShelfView';
import BookEditor from './components/BookEditor';
import { loadShelf, saveShelf } from './store';
import type { Book, BookShelf } from './types';
import './index.css';

export default function App() {
  const [shelf, setShelf] = useState<BookShelf>(loadShelf);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedBook = shelf.find((b) => b.id === selectedId) ?? null;

  const handleSelect = (id: number) => setSelectedId(id);

  const handleBack = () => setSelectedId(null);

  const handleChange = useCallback(
    (updated: Book) => {
      const next = shelf.map((b) => (b.id === updated.id ? updated : b));
      setShelf(next);
      saveShelf(next);
    },
    [shelf],
  );

  return (
    <div className="app">
      {selectedBook ? (
        <BookEditor book={selectedBook} onChange={handleChange} onBack={handleBack} />
      ) : (
        <BookShelfView shelf={shelf} onSelect={handleSelect} />
      )}
    </div>
  );
}
