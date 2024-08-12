import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { dbConnect } from '../../lib/dbConnect';
import { handleAPIError } from '../../lib/handleAPIError';
import prisma from '../../lib/prisma';
import { apiRes } from '../../types';

export const DELETE = async (req: Request, res: NextResponse) =>
  handleAPIError(async () => {
    dbConnect();
    const postId = req.url.split('/post/')[1];

    const deletedReplies = await prisma.postReply.deleteMany({ where: { postId } });
    const deletedLikes = await prisma.like.deleteMany({ where: { postId } });
    const deletedPost = await prisma.post.delete({ where: { id: postId } });
    return NextResponse.json<apiRes>({ message: 'success', data: deletedPost }, { status: 200 });
  });

export const GET = async (req: Request, res: NextResponse) =>
  handleAPIError(async () => {
    dbConnect();
    const postId = req.url.split('/post/')[1];

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          include: {
            tags: true,
          },
        },
        likes: {
          include: {
            user: true,
          },
        },
        replies: {
          include: {
            author: {
              include: {
                tags: true,
              },
            },
          },
        },
      },
    });

    const postAvatar = await (await clerkClient().users.getUser(post.author.clerkId)).imageUrl;

    const postWithAvatar = {
      ...post,
      avatar: postAvatar,
      replies: await Promise.all(
        post.replies.map(async (reply) => ({
          ...reply,
          avatar: (await clerkClient().users.getUser(reply.author.clerkId)).imageUrl,
        })),
      ),
    };

    return NextResponse.json<apiRes>({ message: 'success', data: postWithAvatar }, { status: 200 });
  });
