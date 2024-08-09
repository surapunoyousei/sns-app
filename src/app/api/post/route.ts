import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { dbConnect } from '../lib/dbConnect';
import { handleAPIError } from '../lib/handleAPIError';
import prisma from '../lib/prisma';
import { findSpecificUser } from '../lib/user/findSpecificUser';
import { apiRes } from '../types';

export const GET = async (req: Request, res: NextResponse) =>
  handleAPIError(async () => {
    const { getUser } = clerkClient().users;
    await dbConnect();
    const posts = await prisma.post.findMany({
      include: {
        author: {
          include: {
            tags: true,
          },
        },
        likes: {
          include: {
            author: true,
          },
        },
        replies: {
          include: {
            author: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const postsWithAvatar = await Promise.all(
      posts.map(async (post) => {
        return {
          ...post,
          avatar: (await clerkClient().users.getUser(post.author.clerkId)).imageUrl,
        };
      }),
    );

    return NextResponse.json<apiRes>(
      { message: 'success', data: postsWithAvatar },
      { status: 200 },
    );
  });

export const POST = async (req: Request, res: NextResponse) =>
  handleAPIError(async () => {
    dbConnect();

    const { content } = await req.json();
    //clerkのuserIdからUserテーブルのuserIdを取得
    const { userId } = auth();

    // const userId = process.env.clerkId;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await findSpecificUser(userId);

    //postgresqlに投稿
    const newPost = await prisma.post.create({
      data: {
        content,
        author: {
          connect: { id: user.id },
        },
      },
      include: {
        author: true,
      },
    });

    return NextResponse.json<apiRes>({ message: 'success', data: newPost }, { status: 200 });
  });
