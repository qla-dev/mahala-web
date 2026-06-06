export type Topic = {
  id: string;
  name: string;
  slug: string;
  count: number;
  color?: string;
  description?: string;
  icon?: string;
  mahalaId?: string | null;
  location?: string;
  premium?: boolean;
  general?: boolean;
};

export type PostReply = {
  id: string;
  apiId?: unknown;
  postApiId?: unknown;
  parentId?: string | null;
  parentApiId?: unknown;
  authorUserId?: unknown;
  author: string;
  content: string;
  timeAgo?: string;
  votes: number;
  upvotes?: number;
  downvotes?: number;
  myVote?: number;
  isAnonymous?: boolean;
  comments: number;
};

export type Post = {
  id: string;
  topicId: string;
  topicName?: string;
  mahalaId?: string | null;
  author: string;
  mahala: string;
  content: string;
  timeAgo: string;
  votes: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  color: string;
  replies: PostReply[];
};
