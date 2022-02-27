import React from 'react'

const ChatProfiledata = (props) => {
  return (
    <div className="flex  items-center bg-cyan-100  px-1 py-2 w-full border-white border">
           <div className="first ml-2 ">
          <img className='h-14 rounded-full' src='https://mdbcdn.b-cdn.net/img/new/avatars/2.webp'/>
           </div>
           <div className="flex flex-col ml-3">
             <span className="text-black text-sm ">Nagesh Joshi </span>
             <span className="text-black font-light text-xs">12h ago </span>
           </div>
         </div>
  )
}

export default ChatProfiledata