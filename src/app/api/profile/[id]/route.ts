import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { dbConnect } from '../../lib/dbConnect';
import { handleAPIError } from '../../lib/handleAPIError';
import prisma from '../../lib/prisma';
import { checkUserIdExists } from '../../lib/user/checkUserIdExists';
import { apiRes } from '../../types';

export const GET = async (req: Request, res: NextResponse) =>
  handleAPIError(async () => {
    const clerkId = req.url.split('/profile/')[1];
    const clerkUser = await clerkClient().users.getUser(clerkId);
    if (!clerkUser)
      return NextResponse.json<apiRes>({ message: 'User not found' }, { status: 404 });

    const { imageUrl } = clerkUser;

    await dbConnect();
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
      include: { tags: true },
    });

    if (!user) return NextResponse.json<apiRes>({ message: 'User not found' }, { status: 404 });

    user.avatar = imageUrl;

    return NextResponse.json<apiRes>({ message: 'Success', data: user }, { status: 200 });
  });

export const PUT = async (req: Request, res: NextResponse) => {
  handleAPIError(async () => {
    await dbConnect();
    const clerkId = req.url.split('/profile/')[1];

    const { name, introduction, userId, avatar } = await req.json();

    //新しく登録するuserIdが存在するかを確認する
    //存在したら、エラーメッセージを返す
    const isUserIdExists = await checkUserIdExists(userId, clerkId);
    if (isUserIdExists)
      return NextResponse.json<apiRes>({ message: 'userId already exits' }, { status: 404 });
    //userIdが存在しなければ、新しいプロフィールを作成する
    else {
      const newProfile = await prisma.user.update({
        data: { name, introduction, id: userId, avatar: avatar ?? '' },
        where: { clerkId: clerkId },
      });

      return NextResponse.json<apiRes>({ message: 'Success', data: newProfile }, { status: 200 });
    }
  });
};
