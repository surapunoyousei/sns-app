"use client";

import { Tag } from "./edit/page";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type UserInfo = {
  id: number;
  clerkId: string;
  name: string;
  email: string;
  introduction: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
};

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userId = pathname.split("/profile/")[1];
        console.log(userId);
        const res = await fetch(`http://localhost:3000/api/profile/${userId}`, {
          cache: "no-cache",
        });
        const data = await res.json();
        console.log(data);
        setUserInfo(data.user);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        setError("ユーザー情報の読み込みに失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [pathname]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
        <h2 className="text-xl font-bold">プロフィール</h2>
        <div className="flex items-center">
          <div className="relative mr-4"></div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center">
            <div>
              <h1 className="text-2xl font-bold">{userInfo?.name}</h1>
              <p className="text-gray-600">@{userInfo?.id}</p>
            </div>
          </div>
          <p className="mb-4 text-gray-700">{userInfo?.introduction}</p>
          <div className="mb-4 flex flex-wrap">
            {userInfo?.tags.map((tag) => (
              <span
                key={tag.id}
                className="mb-2 mr-2 rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800 hover:bg-blue-300"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
        <button className="mt-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          編集
        </button>
      </main>
    </div>
  );
};

export default ProfilePage;
