import React from 'react'
import Mainnavigation from '../../components/Mainnavigation/Mainnavigation'
import Head from 'next/head'
import ChatProfiledata from '../../components/Chat/ChatProfiledata'
const Chat = () => {
  return (<>
    <Head>
      <title>Instagram ▫ Chat</title>
      <meta
        name="description"
        content="Edited and modified by Vaibhav And Nagesh "
      />
      <link rel="icon" href="/insta.ico" />
    </Head>
    <Mainnavigation />
    <div className="w-full h-[600px] bg-blue-300 pt-2">
      <div className="border-gray container border mx-auto my-4 w-[930px] grid grid-cols-3  h-auto rounded">


        <div className="border-gray border-b h-14 flex justify-center items-center bg-white ">
          <span className='font-bold'>Mohanalkarvaibhav ▼</span>
          <span className=''>
            <i className='fa fa-pencil-square' ></i></span>

        </div>




        <div className="border-gray col-span-2 border-b border-l h-14 flex items-center bg-white"  >
          <div className="logo flex flex-row items-center">
            <img
              src="https://mdbcdn.b-cdn.net/img/new/avatars/2.webp"
              className="rounded-full h-6 w-6 border-none ml-10"
              alt="Avatar"
            />

            <span className='font-semibold ml-4'>Mohanalkar Vaibhav </span>

          </div>
          <div className="info ml-80 contrast-200 font-bold text-2xl">
            ⓘ
          </div>




        </div>




        <div className=" h-[500px] bg-white flex flex-nowrap flex-col overflow-auto ">
          <br></br>
          <ChatProfiledata />
          <ChatProfiledata />
          <ChatProfiledata />
          <ChatProfiledata />
          <ChatProfiledata />
          <ChatProfiledata />
          <ChatProfiledata />
          <ChatProfiledata />

          <ChatProfiledata />
          <ChatProfiledata />
          <ChatProfiledata />



        </div>
        <div className="col-span-2 border-l border-gray h-[500px]  bg-white">
          






        </div>
     </div>
    </div>
  </>
  )
}

export default Chat