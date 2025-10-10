export enum ReportReason {
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  SPAM = 'spam',
  COPYRIGHT_VIOLATION = 'copyright_violation',
  HARASSMENT = 'harassment',
  MISINFORMATION = 'misinformation',
  VIOLENCE = 'violence',
  HATE_SPEECH = 'hate_speech',
  OTHER = 'other'
}

export interface BlogReport {
  id: string;
  postId: string;
  postTitle: string;
  postAuthorId: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reason: ReportReason;
  reasonText: string;
  description?: string;
  createdAt: number;
  status: ReportStatus;
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

export interface CreateReportRequest {
  postId: string;
  reason: ReportReason;
  description?: string;
}

export interface ReportWithPost extends BlogReport {
  post?: {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    author?: import('./blog.types').BlogAuthor;
    createdAt: number;
  };
  reporter?: import('./blog.types').BlogAuthor;
}

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  [ReportReason.INAPPROPRIATE_CONTENT]: 'Nội dung không phù hợp',
  [ReportReason.SPAM]: 'Spam',
  [ReportReason.COPYRIGHT_VIOLATION]: 'Vi phạm bản quyền',
  [ReportReason.HARASSMENT]: 'Quấy rối',
  [ReportReason.MISINFORMATION]: 'Thông tin sai lệch',
  [ReportReason.VIOLENCE]: 'Bạo lực',
  [ReportReason.HATE_SPEECH]: 'Ngôn từ thù địch',
  [ReportReason.OTHER]: 'Khác'
};