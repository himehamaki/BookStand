import { useState, useCallback } from 'react';
import type { Book, Chapter, Paragraph } from '../types';
import { exportBookAsText } from '../store';

interface Props {
  book: Book;
  onChange: (updated: Book) => void;
  onBack: () => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function BookEditor({ book, onChange, onBack }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const touch = useCallback(
    (partial: Partial<Book>) => {
      const now = new Date().toISOString();
      onChange({
        ...book,
        ...partial,
        createdAt: book.createdAt ?? now,
        updatedAt: now,
      });
    },
    [book, onChange],
  );

  // ── Title ────────────────────────────────────────────────
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    touch({ title: e.target.value });
  };

  // ── Cover color ──────────────────────────────────────────
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    touch({ coverColor: e.target.value });
  };

  // ── Chapter operations ───────────────────────────────────
  const addChapter = () => {
    touch({
      chapters: [
        ...book.chapters,
        { id: generateId(), title: '', paragraphs: [{ id: generateId(), text: '' }] },
      ],
    });
  };

  const updateChapterTitle = (chId: string, title: string) => {
    touch({
      chapters: book.chapters.map((ch) =>
        ch.id === chId ? { ...ch, title } : ch,
      ),
    });
  };

  const deleteChapter = (chId: string) => {
    touch({ chapters: book.chapters.filter((ch) => ch.id !== chId) });
    setConfirmDelete(null);
  };

  const moveChapter = (chId: string, dir: -1 | 1) => {
    const idx = book.chapters.findIndex((c) => c.id === chId);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= book.chapters.length) return;
    const chs = [...book.chapters];
    [chs[idx], chs[newIdx]] = [chs[newIdx], chs[idx]];
    touch({ chapters: chs });
  };

  // ── Paragraph operations ─────────────────────────────────
  const updateParagraph = (chId: string, pId: string, text: string) => {
    touch({
      chapters: book.chapters.map((ch) =>
        ch.id === chId
          ? {
              ...ch,
              paragraphs: ch.paragraphs.map((p) =>
                p.id === pId ? { ...p, text } : p,
              ),
            }
          : ch,
      ),
    });
  };

  const addParagraph = (chId: string) => {
    touch({
      chapters: book.chapters.map((ch) =>
        ch.id === chId
          ? { ...ch, paragraphs: [...ch.paragraphs, { id: generateId(), text: '' }] }
          : ch,
      ),
    });
  };

  const deleteParagraph = (chId: string, pId: string) => {
    touch({
      chapters: book.chapters.map((ch) => {
        if (ch.id !== chId) return ch;
        const remaining = ch.paragraphs.filter((p) => p.id !== pId);
        return {
          ...ch,
          paragraphs:
            remaining.length > 0 ? remaining : [{ id: generateId(), text: '' }],
        };
      }),
    });
  };

  // ── Export ───────────────────────────────────────────────
  const handleExport = () => {
    const text = exportBookAsText(book);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title || `book_${book.id}`}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="editor-container">
      {/* ── Header ── */}
      <div className="editor-header">
        <button className="btn-back" onClick={onBack}>
          ← 本棚に戻る
        </button>
        <button className="btn-export" onClick={handleExport}>
          📄 エクスポート
        </button>
      </div>

      {/* ── Cover ── */}
      <section className="editor-cover" style={{ backgroundColor: book.coverColor }}>
        <div className="cover-inner">
          <label className="cover-title-label">
            <span className="sr-only">タイトル</span>
            <input
              className="cover-title-input"
              type="text"
              placeholder="タイトルを入力…"
              value={book.title}
              onChange={handleTitleChange}
              maxLength={60}
            />
          </label>
          <div className="cover-meta">
            <label className="cover-color-label">
              表紙の色:
              <input
                type="color"
                value={book.coverColor}
                onChange={handleColorChange}
                className="cover-color-picker"
              />
            </label>
          </div>
        </div>
      </section>

      {/* ── Dates ── */}
      {(book.createdAt || book.updatedAt) && (
        <div className="editor-dates">
          {book.createdAt && (
            <span>執筆開始: {new Date(book.createdAt).toLocaleString('ja-JP')}</span>
          )}
          {book.updatedAt && (
            <span>最終更新: {new Date(book.updatedAt).toLocaleString('ja-JP')}</span>
          )}
        </div>
      )}

      {/* ── Chapters ── */}
      <div className="editor-body">
        {book.chapters.map((ch: Chapter, ci: number) => (
          <section key={ch.id} className="chapter-block">
            <div className="chapter-header">
              <span className="chapter-number">第 {ci + 1} 章</span>
              <input
                className="chapter-title-input"
                type="text"
                placeholder="章のタイトル…"
                value={ch.title}
                onChange={(e) => updateChapterTitle(ch.id, e.target.value)}
                maxLength={80}
              />
              <div className="chapter-actions">
                <button
                  className="btn-icon"
                  disabled={ci === 0}
                  onClick={() => moveChapter(ch.id, -1)}
                  title="上へ移動"
                >
                  ↑
                </button>
                <button
                  className="btn-icon"
                  disabled={ci === book.chapters.length - 1}
                  onClick={() => moveChapter(ch.id, 1)}
                  title="下へ移動"
                >
                  ↓
                </button>
                {confirmDelete === ch.id ? (
                  <>
                    <button
                      className="btn-danger"
                      onClick={() => deleteChapter(ch.id)}
                    >
                      削除確認
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => setConfirmDelete(null)}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <button
                    className="btn-icon btn-icon--danger"
                    onClick={() => setConfirmDelete(ch.id)}
                    title="章を削除"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>

            {/* Paragraphs */}
            <div className="paragraphs">
              {ch.paragraphs.map((p: Paragraph, pi: number) => (
                <div key={p.id} className="paragraph-row">
                  <textarea
                    className="paragraph-input"
                    placeholder={`段落 ${pi + 1}…`}
                    value={p.text}
                    onChange={(e) => updateParagraph(ch.id, p.id, e.target.value)}
                    rows={3}
                  />
                  <button
                    className="btn-icon btn-icon--danger para-delete"
                    onClick={() => deleteParagraph(ch.id, p.id)}
                    title="この段落を削除"
                    disabled={ch.paragraphs.length === 1 && !p.text}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="btn-add-paragraph"
                onClick={() => addParagraph(ch.id)}
              >
                ＋ 段落を追加
              </button>
            </div>
          </section>
        ))}

        <button className="btn-add-chapter" onClick={addChapter}>
          ＋ 章を追加
        </button>
      </div>
    </div>
  );
}
