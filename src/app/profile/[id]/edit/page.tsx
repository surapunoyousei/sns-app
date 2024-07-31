'use client';

import Header from '@/components/element/Header';
import RemovableUserTag from '@/components/element/RemovableUserTag';
import UserTag from '@/components/element/UserTag';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Loader2, Plus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1),
  id: z.string().min(1),
  introduction: z.string().min(1),
  tags: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      createdAt: z.date(),
      updatedAt: z.date(),
    }),
  ),
});

export type Tag = z.infer<typeof formSchema>['tags'][0];

const fetchUserInfo = async (userId: string) =>
  fetch(`http://localhost:3000/api/profile/${userId}`)
    .then((res) => res.json())
    .then((data) => data.data);

const fetchTags = async () =>
  fetch('http://localhost:3000/api/tag', { cache: 'no-cache' })
    .then((res) => res.json())
    .then((data) => data.data);

const ProfileEditPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      id: '',
      introduction: '',
      tags: [],
    },
  });

  const [pageError, setPageError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<z.infer<typeof formSchema>['tags']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const notOwnedTags = availableTags.filter(
    (tag) => !getValues('tags')?.some((ownedTag) => ownedTag.name === tag.name),
  );

  useEffect(() => {
    const fetchTagsAndSetAvailableTags = async () => {
      try {
        const tags = await fetchTags();
        const parsedTags = tags.map((tag: Tag) => ({ id: tag.id, name: tag.name }));
        if (parsedTags) setAvailableTags(parsedTags);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
        setPageError('タグの読み込みに失敗しました。');
      }
    };
    fetchTagsAndSetAvailableTags();
  }, [pathname]);

  useEffect(() => {
    const fetchUserInfoAndSetDefaultValues = async () => {
      const userId = pathname.split('/profile/')[1].split('/')[0];
      try {
        const userInfo = await fetchUserInfo(userId);
        setValue('name', userInfo.name);
        setValue('id', userInfo.id);
        setValue('introduction', userInfo.introduction);
        setValue('tags', userInfo.tags);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        setPageError('ユーザー情報の読み込みに失敗しました。');
      }
    };
    fetchUserInfoAndSetDefaultValues();
  }, [pathname, setValue]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    const userId = pathname.split('/profile/')[1].split('/')[0];
    const { name, id, introduction, tags } = data;

    try {
      const userInfoRes = await fetch(`http://localhost:3000/api/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, introduction, id }),
      });

      const tagRes = await fetch('http://localhost:3000/api/tag', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tagNames: tags?.map((tag) => tag.name),
          clerkId: userId,
        }),
      });

      const tagData = await tagRes.json();
      console.log('Tag update response:', tagData);

      router.push(`/profile/${userId}`);
    } catch (error) {
      console.error('Failed to update user info:', error);
      setError('root.error', { message: 'ユーザー情報の更新に失敗しました。' });
    }
  };

  const handleAddTag = (newTag: Tag) => {
    const newOwnedTags = structuredClone(getValues('tags'));

    newOwnedTags.push(newTag);

    setValue('tags', newOwnedTags);
    setAvailableTags(availableTags.filter((tag) => tag.name !== newTag.name));
  };

  const handleRemoveTag = (tagToRemove: Tag) => {
    const newOwnedTags = getValues('tags').filter((tag) => tag.id !== tagToRemove.id);
    setValue('tags', newOwnedTags);
    setAvailableTags([...availableTags, tagToRemove]);
  };

  if (isLoading)
    return (
      <div className='flex h-svh w-full flex-1 grow flex-col items-center justify-center gap-4 bg-gray-100'>
        <Loader2 size='64' className='animate-spin text-blue-600' />
        ロード中...
      </div>
    );

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <Header title={'プロフィール編集'} />
      <main className='flex-1 overflow-y-auto bg-gray-100 p-6'>
        <form className='rounded-lg bg-white p-6 shadow' onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-4'>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
              名前
            </label>
            <input
              {...register('name')}
              type='text'
              name='name'
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200/50'
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='userId' className='block text-sm font-medium text-gray-700'>
              ユーザーID
            </label>
            <div className='mt-1 flex rounded-md shadow-sm'>
              <span className='inline-flex items-center rounded-sm border border-gray-300 bg-gray-50 px-3 text-sm text-gray-500'>
                @
              </span>
              <input
                {...register('id')}
                type='text'
                id='userId'
                name='userId'
                className='block w-full flex-1 rounded-sm border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200/50'
              />
            </div>
          </div>
          <div className='mb-4'>
            <label htmlFor='bio' className='block text-sm font-medium text-gray-700'>
              自己紹介
            </label>
            <textarea
              {...register('introduction')}
              rows={3}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200/50'
            ></textarea>
          </div>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>タグ</label>
            <div className='mt-2 flex flex-wrap'>
              {getValues('tags')?.map((tag) => (
                <RemovableUserTag
                  key={tag.id}
                  tagName={tag.name}
                  handleRemoveTag={() => handleRemoveTag(tag)}
                />
              ))}
            </div>
          </div>
          <div>
            <button
              type='button'
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className='flex w-full items-center justify-between rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50'
            >
              <span className='flex items-center'>
                <Plus size={20} className='mr-2' />
                タグを追加
              </span>
              {isDrawerOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <div
              className={`mt-2 overflow-scroll rounded-md border border-gray-200 bg-white transition-all duration-300 ease-in-out ${
                isDrawerOpen ? 'max-h-64' : 'max-h-0'
              }`}
            >
              <div className='p-4'>
                <input
                  type='text'
                  placeholder='タグを検索'
                  className='mb-4 w-full rounded-md border px-3 py-2'
                />
                <div className='flex flex-wrap gap-2'>
                  {notOwnedTags.map((tag) => (
                    <div key={tag.id} onClick={() => handleAddTag(tag)}>
                      <UserTag tagName={tag.name}></UserTag>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
        <button
          className='mt-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50'
          onClick={handleSubmit(onSubmit)}
        >
          保存
        </button>
      </main>
    </div>
  );
};

export default ProfileEditPage;
