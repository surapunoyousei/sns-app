'use client';

import useData from '@/hooks/useData';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';
import { z } from 'zod';
import { supabase } from '../api/lib/supabase/supabase';

const ImageItem = ({ imageUrl }: { imageUrl: string }) => {
  console.log(imageUrl);
  const [imageURL, setImageURL] = useState<string | null>(null);
  useEffect(() => {
    if (imageUrl) {
      getImageUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getImageUrl() {
    const { data } = supabase.storage.from('post-images').getPublicUrl(imageUrl);
    console.log(data);
    setImageURL(data.publicUrl);
  }

  if (!imageURL) return <div>loading...</div>;
  return (
    <Image
      className='rounded-md object-contain'
      src={imageURL}
      alt='image'
      width={180}
      height={180}
      unoptimized={imageUrl.endsWith('.gif')}
    />
  );
};

const ImageSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const Page = () => {
  const [image, setImage] = useState<File | null>(null);
  const { mutate } = useSWRConfig();

  const { data: images, error, isLoading } = useData('/api/image', z.array(ImageSchema));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('送信');
    e.preventDefault();

    if (!image) {
      alert('画像を選択してください');
      return;
    }
    const formData = new FormData();
    formData.append('image', image);

    const response = await fetch('/api/image', {
      method: 'POST',
      body: formData,
    });

    mutate('/api/image');
  };

  console.log(images);
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto'>
      <form onSubmit={onSubmit}>
        <input
          type='file'
          accept='image/*'
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
        <button type='submit'>アップロード</button>
      </form>
      <div className='flex flex-wrap gap-2'>
        {images?.map((image) => <ImageItem key={image.id} imageUrl={image.imageUrl} />)}
      </div>
    </div>
  );
};

export default Page;
