import prisma from '@/app/api/lib/prisma';
import { NextResponse } from 'next/server';
import { findSpecificUser } from '../../lib/user/findSpecificUser';
import { dbConnect } from './../../lib/dbConnect';
import { handleAPIError } from './../../lib/handleAPIError';
import { apiRes } from './../../types/index';

//ユーザーがいいねした投稿を返すapi
export const GET = async (req: Request, res: NextResponse) =>
  handleAPIError(async () => {
    dbConnect();

    //clerkId
    const clerkId = req.url.split('/like/')[1];

    if (!clerkId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await findSpecificUser(clerkId);

    const likedPost = await prisma.like.findMany({
      where: {
        authorId: user.id,
      },
      include: { post: true, author: true },
    });
    return NextResponse.json<apiRes>({ message: 'success', data: likedPost }, { status: 200 });
  });
