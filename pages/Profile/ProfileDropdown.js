import React from "react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  UserIcon,
  BookmarkIcon,
  CogIcon,
  SwitchHorizontalIcon,
} from "@heroicons/react/outline";

export default function ProfileDropdown() {
  return (
    <div className="border-none">
      <Menu as="div" className="relative inline-block ">
        <div>
          <Menu.Button className="hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            <img
              src="https://mdbcdn.b-cdn.net/img/new/avatars/2.webp"
              className="rounded-full h-7 w-7 border-none"
              alt="Avatar"
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1 ">
              <Menu.Item>
                <button className=" text-white text-gray-900 group flex rounded-md items-center w-full px-2 py-2 text-sm hover:bg-violet-500">
                  <UserIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                  Profile
                </button>
              </Menu.Item>
            </div>
            <div className="px-1 py-1 ">
              <Menu.Item>
                <button className=" text-white text-gray-900 group  flex rounded-md items-center w-full px-2 py-2 text-sm hover:bg-violet-500">
                  <BookmarkIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                  Saved
                </button>
              </Menu.Item>
            </div>
            <div className="px-1 py-1 ">
              <Menu.Item>
                <button className=" text-white text-gray-900 group flex rounded-md items-center w-full px-2 py-2 text-sm hover:bg-violet-500">
                  <CogIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                  Setting
                </button>
              </Menu.Item>
            </div>
            <div className="px-1 py-1 ">
              <Menu.Item>
                <button className=" text-white textra-gy-900 group flex rounded-md items-center w-full px-2 py-2 text-sm hover:bg-violet-500">
                  <SwitchHorizontalIcon
                    className="w-5 h-5 mr-2"
                    aria-hidden="true"
                  />
                  Switch Accounts
                </button>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
