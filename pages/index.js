import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import Link from "next/link";
import { HomeIcon, ChatIcon } from "@heroicons/react/solid";
import ProfileDropdown from "./Profile/ProfileDropdown";
export default function Home() {
  const router = useRouter();
  const loginhandelr = () => {
    router.push("/Login");
  };

  return (
    <>
      <Head>
        <title>Login ▫ Instagram</title>
        <meta
          name="description"
          content="Edited and modified by Vaibhav And Nagesh "
        />
        <link rel="icon" href="/insta.ico" />
      </Head>
      <div className="flex flex-row">
        <div>
          <img src="https://i.imgur.com/zqpwkLQ.png" />
        </div>
        <div>
          <div class="max-w-md mx-auto">
            <div class="relative flex items-center w-full h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden">
              <div class="grid place-items-center h-full w-12 text-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
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
                class="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
                type="text"
                id="search"
                placeholder="Search something.."
              />
            </div>
          </div>
        </div>
        <div>
          <HomeIcon className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <ChatIcon className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <ProfileDropdown />
        </div>
      </div>
      {/* <div className="flex justify-center items-center my-40 text-4xl">
        <Link href="/Login">
          <h1 className="cursor-pointer text-blue-600 ">Login page touch me</h1>
        </Link>
      </div> */}
    </>
  );
}
