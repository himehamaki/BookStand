export interface Paragraph {
  id: string;
  text: string;
}

export interface Chapter {
  id: string;
  title: string;
  paragraphs: Paragraph[];
}

export interface Book {
  id: number; // 1–10, shelf slot
  title: string;
  coverColor: string;
  chapters: Chapter[];
  createdAt: string | null; // ISO string; null = never edited
  updatedAt: string | null;
}

export type BookShelf = Book[];
