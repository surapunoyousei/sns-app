'use client';

import Button from '@/components/element/Button';
import Header from '@/components/element/Header';
import UserTag from '@/components/element/UserTag';
import useUserInfo from '@/hooks/useUserInfo';
import { Tag } from '@/lib/types';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { mutate } from 'swr';

import { ImageDisplayModal } from '@/components/element/ImageDisplayModal';
import ProfileSkeltonLoading from '@/components/loading/ProfileSkeltonLoading';
import ProfilePost from '@/components/profile/ProfilePost';
import { useImageModal } from '@/hooks/useImageModal';
import { ICON_IMAGE_BASE_URL } from '@/lib/constants';
import { ProfileSchema } from '@/lib/schemas';
import { useSession } from 'next-auth/react';

const ProfilePage = () => {
  const userId = usePathname().split('/profile/')[1];
  const { data: session, update } = useSession();
  const { userInfo, isLoading, isError } = useUserInfo(userId, ProfileSchema);
  const { isImageModalOpen, modalSrc, openImageModal, closeImageModal } = useImageModal();

  useEffect(() => {
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading || !userInfo || !session?.user?.id) {
    return <ProfileSkeltonLoading title={'プロフィール'} subtitle={''} />;
  }

  if (isError) {
    console.log('error:', isError);
    setTimeout(() => {
      mutate(`/api/profile/${userId}`);
    }, 5000);
  } else if (isError) {
    return <div>Error</div>;
  }

  return (
    <div className='flex h-screen flex-1 flex-col overflow-hidden'>
      <Header title={'プロフィール'} />
      <main className='h-screen overflow-y-auto bg-gray-100'>
        {isImageModalOpen && (
          <ImageDisplayModal src={modalSrc} closeModal={closeImageModal}></ImageDisplayModal>
        )}
        <Toaster />
        <div className='mx-auto max-w-5xl py-8 sm:px-6 lg:px-8'>
          <div className='mx-2 mb-8 rounded-lg bg-white p-6 shadow sm:p-8'>
            <div className='mb-6 flex flex-col items-center sm:flex-row sm:items-start'>
              <div className='mb-4 sm:mb-0 sm:mr-6'>
                {userInfo?.iconUrl ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openImageModal(`${ICON_IMAGE_BASE_URL}${userInfo.iconUrl}`);
                    }}
                  >
                    <Image
                      src={`${ICON_IMAGE_BASE_URL}${userInfo.iconUrl}`}
                      alt={`${userInfo.name}のアバター`}
                      width={120}
                      height={120}
                      className='rounded-full'
                    />
                  </button>
                ) : (
                  <div className='flex size-28 items-center justify-center rounded-full bg-gray-200 text-gray-500'>
                    No Image
                  </div>
                )}
              </div>
              <div className='flex-1 text-center sm:text-left'>
                <h1 className='mb-2 text-3xl font-bold text-gray-900 sm:text-4xl'>
                  {userInfo?.name}
                </h1>
                <p className='mb-2 text-base text-gray-500 sm:text-lg'>@{userInfo?.id}</p>
                <p className='mb-4 break-words text-base text-gray-700 sm:text-lg'>
                  {userInfo?.introduction}
                </p>
                <div className='mb-4'>
                  <div className='flex flex-wrap gap-2'>
                    {userInfo?.tags && userInfo?.tags.length > 0 ? (
                      userInfo?.tags.map((tag: Tag) => <UserTag key={tag.id} tagName={tag.name} />)
                    ) : (
                      <p className='text-base text-gray-500'>タグが設定されていません</p>
                    )}
                  </div>
                </div>
                {session.user.id === userInfo.id && (
                  <div className='mt-4'>
                    <Button title={'プロフィール編集'} href={`${userId}/edit`} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <ProfilePost posts={userInfo.posts} currentUserId={session.user.id} />
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
