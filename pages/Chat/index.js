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
    <div className="w-full h-[600px] bg-cyan-100 pt-1">
      <div className="border-gray container border mx-auto my-4 w-[930px] grid grid-cols-3 grid-row-3 h-auto rounded">


        <div className="border-gray border-b h-14 flex justify-center items-center bg-white ">
          <span className='font-bold'>Mohanalkarvaibhav ▼</span>
          <span className=''>
            
            </span>

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
        <div className="col-span-2 border-l border-gray h-[500px] flex flex-col-reverse  bg-white ">
          <div className=" ">
            <div className="flex justify-center items-center text-xs">Today 8:33 PM</div>
            <div className="flex flex-row"><div className="massages  h-8 rounded-full my-5  mr-4 pr-4 py-1 bg-cyan-100 ml-4 pl-4 ">Congrates page are ready to show</div></div>
            <div className="flex flex-row-reverse"><div className="massages  h-8 rounded-full my-5  mr-4 pr-4 py-1 bg-cyan-100 ml-4 pl-4 ">Ohh Well Done!!</div></div>


            <div className="rounded-full  border flex  h-10 mb-2  w-[600px] mx-2 bg-blue">
              <div className="emoji text-4xl flex ">☺</div>
              <input className='mx-2' type="text" placeholder='Message...'/>
              <div className="flex space-x-2 ml-52 justify-center">
                <div className="media">Media</div>
              <div className="like">heart</div>
              </div>
            </div>
          </div>

        </div>





      </div>
    </div>
  </>
  )
}

export default Chat