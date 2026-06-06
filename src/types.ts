export type Topic = {
  id: string;
  name: string;
  slug: string;
  count: number;
  color?: string;
  description?: string;
  icon?: string;
  premium?: boolean;
  general?: boolean;
};

export type PostReply = {
  id: string;
  author: string;
  content: string;
  votes: number;
  comments: number;
};

export type Post = {
  id: string;
  topicId: string;
  topicName?: string;
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
