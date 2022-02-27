import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  HomeIcon,
  ChatIcon,
  PlusCircleIcon,
  TemplateIcon,
  HeartIcon,
} from "@heroicons/react/outline";
import ProfileDropdown from "./Profile/ProfileDropdown";
import Mainnavigation from "../components/Mainnavigation/Mainnavigation";
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
      <Mainnavigation></Mainnavigation>
    </>
  );
}
