'use client';
import Header from '@/components/element/Header';
import FixedHeader from '@/components/layout/FixedHeader';
import { Post } from '@/components/timeline/Post';
import useData from '@/hooks/useData';
import { LoaderCircle } from 'lucide-react';
import { z } from 'zod';

export const postSchema = z
  .object({
    id: z.string(),
    content: z.string(),
    avatar: z.string(),
    authorId: z.string(),
    createdAt: z.string(),
    author: z.object({
      id: z.string(),
      name: z.string(),
      clerkId: z.string(),
      introduction: z.string(),
      tags: z.array(z.object({ id: z.string(), name: z.string() })).optional(), // tagsをオプションにする
    }),
    likes: z.array(
      z.object({
        author: z.object({ id: z.string(), name: z.string(), clerkId: z.string() }),
      }),
    ),
    replies: z.array(
      z.object({
        id: z.string(),
        content: z.string(),
        createdAt: z.string(),
        parentReplyId: z.string().nullable(),
        author: z.object({
          id: z.string(),
          name: z.string(),
          clerkId: z.string(),
          tags: z.array(z.object({ id: z.string(), name: z.string() })).optional(), // tagsをオプションにする
        }),
      }),
    ),
  })
  .array();

const TimelineAll = () => {
  const { data, error, isLoading } = useData('/api/post', postSchema);

  if (error) {
    return <div>Error</div>;
  }

  if (isLoading || !data) {
    return (
      <div className='flex h-svh w-full flex-1 grow flex-col items-center justify-center gap-4 bg-gray-100'>
        <LoaderCircle size='64' className='animate-spin text-blue-600' />
        ロード中...
      </div>
    );
  }

  return (
    <div className='flex w-full flex-1 grow flex-col items-center gap-4 overflow-y-scroll bg-gray-100'>
      <FixedHeader title={'タイムライン'} target={'すべて'} />
      <Header title={''} />
      <div className='flex w-full grow flex-col items-center gap-y-4 p-3'>
        {data.map((post) => (
          <Post
            key={post.id}
            username={post.author.name}
            clerkId={post.author.clerkId}
            id={post.author.id}
            timestamp={post.createdAt}
            content={post.content}
            tags={post.author.tags}
            introduction={post.author.introduction}
            postId={post.id}
            avatar={post.avatar}
            likes={post.likes}
            replyCount={post.replies.filter((reply) => reply.parentReplyId === null).length}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineAll;
