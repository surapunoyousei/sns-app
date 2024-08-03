'use client';
import TimeLineHeader from '@/components/layout/TimeLineHeader';
import { Post } from '@/components/timeline/Post';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import useSWR from 'swr';
import { z } from 'zod';

export const postSchema = z.object({
  author: z.object({
    name: z.string(),
    id: z.string(),
    clerkId: z.string(),
    tags: z.array(z.object({ name: z.string(), id: z.string() })),
  }),
  createdAt: z.string(),
  content: z.string(),
  id: z.string(),
});

const TimelineAll = () => {
  const pathName = usePathname();
  const tagId = pathName.split('/timeline/')[1];
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR('/api/post', fetcher, {
    refreshInterval: 20000,
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className='flex h-svh w-full flex-1 grow flex-col items-center justify-center gap-4 bg-gray-100'>
        <Loader2 size='64' className='animate-spin text-blue-600' />
        ロード中...
      </div>
    );
  }
  if (error) {
    return <div>Error</div>;
  }

  const posts = postSchema.array().parse(data.data);
  const filteredPosts = posts.filter((post) => post.author.tags.some((tag) => tag.id === tagId));
  const filteredTagName = filteredPosts[0].author.tags.find((tag) => tag.id === tagId)?.name;

  return (
    <div className='flex w-full flex-1 grow flex-col items-center gap-4 overflow-y-scroll bg-gray-100'>
      <TimeLineHeader target={filteredTagName} />
      <div className='flex w-full grow flex-col items-center gap-y-4 p-3'>
        {filteredPosts.map((post, index) => (
          <Post
            key={index}
            username={post.author.name}
            clerkId={post.author.clerkId}
            userId={post.author.id}
            timestamp={post.createdAt}
            content={post.content}
            tags={post.author.tags}
            postId={post.id}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineAll;
