import React from 'react'
import Head from 'next/head'
import Mainnavigation from '../../components/Mainnavigation/Mainnavigation'
import Status from '../../components/Profile/Status'
import Posts from '../../components/Profile/Posts'
const Profile = () => {
  return (
    <>
      <Head>
        <title>vaibhav Mohnalkar (@Mohanalkarvaibhav)</title>
        <meta
          name="description"
          content="Edited and modified by Vaibhav And Nagesh "
        />
        <link rel="icon" href="/insta.ico" />
      </Head>
      <Mainnavigation></Mainnavigation>
      <div className="bg-gray-50 h-screen mt-0 flex-col ">

        
     
      <div className="flex  space-x-14 py-8 ">
        <div className="profile ml-72 ">
          <img
            src="https://mdbcdn.b-cdn.net/img/new/avatars/2.webp"
            className="rounded-full h-40 w-40 border-none"
            alt="Avatar"
          />
        </div>


        <div className="flex flex-col items-center space-y-4 mt-3">
          <div className="flex flex-row justify-center items-center">
            <span className="font-thin text-3xl ml-1">mohanalkarvaibhav</span>
            <span className="border px-1 py-1 rounded text-sm mx-4 font-bold">Edit Profile</span>
            <span className="text-3xl ">&#9881;</span>
          </div>

          <div className="flex flex-row space-x-20">
            <span className="item1 "><span className="font-bold">60</span>Posts</span>
            <span className="item2"><span className="font-bold">60</span>Followers</span>
            <span className="item3"><span className="font-bold">60</span>Following</span>
          </div>

          <div className="">
            <span className="mr-[250px]">Vaibhav Mohanlkar</span>
            
          </div>

        </div>

      </div>

      <div className="flex flex-nowrap justify-center items-center space-x-12 w-[800px] ml-72  overflow-hidden">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Status/>
        <Status/>
        <Status/>
        <Status/>
        <Status/>
        <Status/>
        <Status/>

      </div>
      <div className="flex flex-nowrap justify-center items-center space-x-12 w-[800px] ml-72 border-t mt-8 overflow-hidden">
        <div className="posts cursor-pointer border-black">posts</div>
        <div className="reels cursor-pointer">reels</div>
        <div className="videos cursor-pointer">videos</div>
        <div className="saved cursor-pointer">saved</div>
        <div className="tagged cursor-pointer">tagged</div>
      </div>

      <div className="flex flex-col  space-x-12 w-[800px] ml-72  mt-8 overflow-hidden">
        <div className="flex flex-row space-x-7 space-y-8 justify-center items-center mr-2">
          <div className="empt"></div>
        <Posts/>
        <Posts/>
        <Posts/>
        </div>
        <div className="flex flex-row space-x-7 space-y-8  mr-2">
          <div className="empt"></div>
        <Posts/>
        <Posts/>
        <Posts/>
        </div>
        <div className="flex flex-row space-x-7 space-y-8  mr-2">
          <div className="empt"></div>
        <Posts/>
        <Posts/>
        <Posts/>
        </div>
      </div>










      </div>

      
    </>
  )
}

export default Profile;