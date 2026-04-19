export type PostWithMeta = {
  id: string;
  title: string;
  body: string;
  category: string;
  imageUrl: string | null;
  imageId: string | null;
  isPinned: boolean;
  isHot: boolean;
  hotScore: number;
  isHidden: boolean;
  adminNote: string;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    avatarColor: string;
  };
  _count: { comments: number; likes: number };
  likedByMe: boolean;
  myReaction: string | null;
  reactions: Record<string, number>;
  comments?: CommentWithAuthor[];
};

export type CommentWithAuthor = {
  id: string;
  body: string;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    avatarColor: string;
  };
};

export type UserProfile = {
  id: string;
  clerkId: string;
  email: string;
  username: string;
  avatarColor: string;
  isAdmin: boolean;
  isApproved: boolean;
  postsToday: number;
  streak: number;
};

export type PollWithOptions = {
  id: string;
  title: string;
  isPublished: boolean;
  expiresAt: Date;
  createdAt: Date;
  options: {
    id: string;
    text: string;
    sortOrder: number;
    _count: { votes: number };
  }[];
  totalVotes: number;
  myVoteOptionId: string | null;
};
