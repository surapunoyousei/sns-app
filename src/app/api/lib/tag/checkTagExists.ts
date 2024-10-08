import prisma from '../prisma';

//タグがTagテーブルに存在するかを確認
export const checkTagExists = async (tagName: string): Promise<boolean> => {
  //prismaでdbを操作しているのに
  //データベース接続していないのは、この関数の呼び出し元で接続しているから

  const existingTag = await prisma.tag.findUnique({
    where: { name: tagName },
  });

  return existingTag ? true : false;
};
