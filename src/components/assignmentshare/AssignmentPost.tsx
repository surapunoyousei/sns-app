import { useAssignmentLike } from '@/hooks/Like/useAssignmentLike';
import { useDeadline } from '@/hooks/useDeadline';
import { useRelativeTime } from '@/hooks/useRelativeTime';
import { Assignment } from '@/lib/types';
import { Folder, FolderOpen, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import KebabMenu from '../element/KebabMenu';
import TextContent from '../element/TextContent';

type AssignmentPostProps = {
  assignment: Assignment;
  handleDeleteAssignment: Promise<(assignmentId: string) => Promise<void>>;
  currentUserId: string;
};

const AssignmentPost = ({
  assignment,
  handleDeleteAssignment,
  currentUserId,
}: AssignmentPostProps) => {
  const timeAgo = useRelativeTime(assignment.createdAt);
  const limited = useDeadline(assignment.deadLine);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [year, month, day] = assignment.deadLine.split('/')[0].split('-');
  const [hour, minute] = assignment.deadLine.split('/')[1].split(':');
  const deadlineContent = `${year}年${month}月${day}日 ${hour}時${minute}分`;
  const { likesCount, isLiked, isLiking, handleToggleLike } = useAssignmentLike(
    assignment.likes,
    currentUserId,
  );
  return (
    <div className='relative mb-4 w-11/12 rounded-lg bg-white p-6 shadow'>
      <div className='flex justify-between'>
        <div>
          <h2 className='mb-1 pr-20 text-xl font-bold text-gray-800'>{assignment.title}</h2>
          <p className='mb-3 text-sm text-gray-500'>{assignment.author.name}さん</p>
        </div>
        <p className='mr-1 whitespace-nowrap text-sm text-gray-500'>{timeAgo}</p>
      </div>
      <TextContent textContent={assignment.description} />
      <div className='mt-4 items-center text-sm'>
        <p className='text-base text-red-500'>{deadlineContent}まで</p>
        <div className='flex items-center'>
          {limited === 'over' ? (
            <p className='text-base font-bold text-red-500'>締め切りを過ぎています！！！</p>
          ) : (
            <p className='text-base font-bold text-red-500'>あと{limited}</p>
          )}
        </div>
      </div>
      <div className='relative mt-3 flex justify-between text-blue-600'>
        <button onClick={() => handleToggleLike(assignment.id)}>
          {isLiked ? <Folder size={27} fill={'rgb(37 99 235)'} /> : <FolderOpen size={27} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className='text-gray-500 hover:text-gray-700'
        >
          <MoreVertical size={20} fill='red' />
        </button>
        {isDropdownOpen && (
          <KebabMenu
            currentUserId={currentUserId}
            authorUserId={assignment.author.id}
            contentId={assignment.id}
            handleDelete={handleDeleteAssignment}
          />
        )}
      </div>
    </div>
  );
};

export default AssignmentPost;
