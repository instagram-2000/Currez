import React from 'react'

const Status = () => {
  return (
   <div className='flex flex-col '>
    <div className="border flex justify-center items-center px-1 h-20 w-20 rounded-full">
    <img
              src="https://mdbcdn.b-cdn.net/img/new/avatars/2.webp"
              className="rounded-full  "
              alt="Avatar"
            />
    </div>
      <span className="flex justify-center"> status</span>      
   </div>
  )
}

export default Status