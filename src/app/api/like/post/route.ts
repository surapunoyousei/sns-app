import { NextResponse } from 'next/server';
import { dbConnect } from '../../lib/dbConnect';
import { getUserId } from '../../lib/getUserId';
import { handleAPIError } from '../../lib/handleAPIError';
import prisma from '../../lib/prisma';
import { findSpecificUser } from '../../lib/user/findSpecificUser';
import { apiRes } from '../../types';

export const POST = async (req: Request, res: NextResponse) =>
  handleAPIError(async () => {
    dbConnect();

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await req.json();

    const user = await findSpecificUser(userId);

    const newLike = await prisma.like.create({
      data: {
        user: {
          connect: { id: user.id },
        },
        post: { connect: { id: postId } },
      },
      include: {
        post: true,
        user: true,
      },
    });

    return NextResponse.json<apiRes>({ message: 'success', data: newLike }, { status: 200 });
  });

export const DELETE = async (req: Request, res: NextResponse) =>
  handleAPIError(async () => {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await req.json();

    const user = await findSpecificUser(userId);

    const deleteLike = await prisma.like.delete({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    });
    return NextResponse.json({ message: 'success', data: deleteLike }, { status: 200 });
  });
