import React from 'react'
import Link from "next/link";

import {
  HomeIcon,
  ChatIcon,
  PlusCircleIcon,
  TemplateIcon,
  HeartIcon,
} from "@heroicons/react/outline";
import ProfileDropdown from "E:/React apps learning/Programming Notes/Next j/Combine projects/instagram-clone/pages/Profile/ProfileDropdown.js";

const Mainnavigation = () => {
  return (
    <div className="flex flex-row   h-[65px] border-b mb-0 ">
      <div className="flex-none mr-28 ml-44 py-2">
          <img className='h-8 my-3 ml-10 contrast-200' src="https://i.imgur.com/zqpwkLQ.png" />
      </div>
      <div className="flex-initial  border bg-slate-200 h-[35px] my-4 ml-28 w-64 rounded-lg ">
        <div className="max-w-md mx-auto ">
          <div className="relative flex  bg-slate-200 items-center h-6 rounded-lg focus-within:shadow-lg bg-white overflow-hidden">
            <div className="grid place-items-center  w-12 text-black mt-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <input
              className=" bg-slate-200 justify-center mt-2"
              type="text"
              id="search"
              placeholder="Search "
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row flex-initial px-2 mt-5 space-x-4 ml-20 ">
        <div>
          <Link href="/"><HomeIcon className="h-7 w-7" /></Link>
        </div>
        <div>
          <Link href="/Chat"><ChatIcon className="h-7 w-7" /></Link>
        </div>
        <div>
          <Link href="/"><PlusCircleIcon className="h-7 w-7" /></Link>
        </div>
        <div>
          <Link href="/"><TemplateIcon className="h-7 w-7" /></Link>
        </div>
        <div>
          <Link href="/"><HeartIcon className="h-7 w-7" /></Link>
        </div>
        <div>
          <ProfileDropdown></ProfileDropdown>
        </div>
      </div>
    </div>
   
  )
}

export default Mainnavigation