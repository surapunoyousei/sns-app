import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { dbConnect } from '../lib/dbConnect';
import { handleAPIError } from '../lib/handleAPIError';
import prisma from '../lib/prisma';
import { apiRes } from '../types';

export const GET = async (req: Request, res: NextResponse) =>
  handleAPIError(async () => {
    dbConnect();

    //clerkId
    // const { userId } = auth();
    const userId = 'user_2kBasPGZhMBIuxhF7zov5BXVrgq';

    //Userテーブルのid(sns上でのID)
    const { id } = await prisma.user.findUniqueOrThrow({
      where: { clerkId: userId },
    });

    const likedPost = await prisma.like.findMany({
      where: {
        authorId: id,
      },
    });
    return NextResponse.json<apiRes>({ message: 'success', data: likedPost }, { status: 200 });
  });

export const POST = async (req: Request, res: NextResponse) =>
  handleAPIError(async () => {
    dbConnect();

    // const { userId } = auth();
    const userId = 'user_2kBasPGZhMBIuxhF7zov5BXVrgq';

    const { postId } = await req.json();

    const user = await prisma.user.findUniqueOrThrow({
      where: { clerkId: userId },
    });

    const newLike = await prisma.like.create({
      data: {
        author: {
          connect: { id: user.id },
        },
        post: {
          connect: { id: postId },
        },
      },
      include: {
        author: true,
      },
    });
    return NextResponse.json<apiRes>({ message: 'success', data: newLike }, { status: 200 });
  });

export const DELETE = async (req: Request, res: NextResponse) =>
  handleAPIError(async () => {
    const { postId } = await req.json();
    dbConnect();

    //clerkId
    const { userId } = auth();

    //Userテーブルのid(sns上でのID)
    const { id } = await prisma.user.findUniqueOrThrow({
      where: { clerkId: userId },
    });

    const deleteLike = await prisma.like.delete({
      where: {
        authorId_postId: {
          authorId: id,
          postId: postId,
        },
      },
    });
    return NextResponse.json<apiRes>({ message: 'success', data: deleteLike }, { status: 200 });
  });
