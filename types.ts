
export enum ReviewType {
  IDS = 'IDS',
  G_REVIEW = 'G-Review',
  S_REVIEW = 'S-Review'
}

export interface ReviewFormData {
  studentName: string;
  lessonContent: string; // Optional
  phonicsInfo: string;   // New: e.g. "-ad: dad, mad, sad"
  sessionNotes: string;
  type: ReviewType;
  focusRating: number;   // Lesson Engagement/Focus
}

export interface GeneratedReview {
  content: string;
  timestamp: Date;
  type: ReviewType;
  studentName?: string;
}
