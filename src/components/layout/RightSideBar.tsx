'use client';
import { Radar } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const PAGE_TYPE = ['timeline', 'question', 'assignmentshare'];

const RightSideBar = () => {
  const [searchInput, setSearchInput] = useState('');
  const activePage = usePathname().split('/')[1];
  const placeholderWord =
    activePage === 'timeline' ? 'ポスト' : activePage === 'question' ? '質問' : '課題';

  const router = useRouter();
  const handleKeyInput = (event: React.KeyboardEvent) => {
    const key = event.key;

    if (key === 'Enter' && !PAGE_TYPE.includes(activePage)) {
      searchInput.trim() === ''
        ? router.push('/timeline/all')
        : router.push(`/timeline/search/${searchInput}`);
      return;
    }

    if (key === 'Enter' && searchInput.trim() !== '') {
      router.push(`/${activePage}/search/${searchInput}`);
    } else if (key === 'Enter' && searchInput.trim() === '') {
      // 空白の場合は/timeline/allに遷移
      router.push(`/${activePage}/all`);
    }
    return;
  };
  const handleClick = () => {
    if (searchInput.trim() !== '') {
      router.push(`/${activePage}/search/${searchInput}`);
    } else if (searchInput.trim() === '') {
      router.push(`/${activePage}/all`);
    }
  };

  return (
    <div className='z-10 ml-auto hidden w-80 border-l border-gray-200 bg-white p-4 font-bold xl:flex xl:justify-center'>
      <div className='flex h-8 w-11/12 items-center justify-center gap-4 rounded-2xl ring-1 ring-blue-500'>
        <button onClick={handleClick}>
          <Radar size={20} color={'rgb(59 130 246)'} />
        </button>
        <input
          className='w-9/12 outline-none'
          type='text'
          placeholder={`${PAGE_TYPE.includes(activePage) ? placeholderWord : 'ポスト'}を検索`}
          value={searchInput}
          onChange={(e) => setSearchInput(e.currentTarget.value)}
          onKeyDown={handleKeyInput}
        />
      </div>
    </div>
  );
};

export default RightSideBar;
