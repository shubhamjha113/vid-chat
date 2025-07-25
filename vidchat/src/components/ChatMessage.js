import React from 'react';

const ChatMessage = ({ name, message }) => {
  // Randomly choose gender
  const gender = Math.random() > 0.5 ? "men" : "women";

  // Generate random image ID (0 to 99)
  const randomId = Math.floor(Math.random() * 100);

  // Construct the avatar URL
  const avatarUrl = `https://randomuser.me/api/portraits/${gender}/${randomId}.jpg`;

  return (
    <div className='flex items-center my-2'>
      <img
        className='h-8 w-8 rounded-full object-cover'
        src={avatarUrl}
        alt='user avatar'
      />
      <span className='font-bold px-2 shadow-sm p-2'>{name}</span>
      <span>{message}</span>
    </div>
  );
};

export default ChatMessage;
