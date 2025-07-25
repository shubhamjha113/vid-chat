import React, { useEffect } from 'react'
import ChatMessage from './ChatMessage'
import { useDispatch,useSelector } from 'react-redux';
import {addMessage} from '../utils/chatSlice'
import { generateRandomName, makeRandomMessage } from '../utils/helper';

const LiveChat = () => {
    const dispatch = useDispatch();
    const chatMessages = useSelector((store) => store.chat.messages);


    useEffect(()=>{
        const i = setInterval(()=>{
          const randomName = generateRandomName();
            //API polling 
            // console.log("Random Name:", generateRandomName());
            dispatch(addMessage({
              name: randomName,
              message: makeRandomMessage(),
            }))


        },500);

        return ()=>clearInterval(i);
    },[])




  return (
    <div className='w-full h-[400px] ml-2 p-2 border border-black dark:border-gray-600 bg-slate-100 dark:bg-gray-800 text-black dark:text-white rounded-lg overflow-y-scroll flex flex-col-reverse'>
      {
            // Disclaimer: Don't use indexes as keys
            chatMessages.map((c, i) => (
              <ChatMessage key={i} name={c.name} message={c.message} />
            ))
          }
    </div>
  )
}

export default LiveChat
