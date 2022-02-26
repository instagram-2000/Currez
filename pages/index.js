import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'
export default function Home() {
  const router = useRouter()

  return (
    <>
   
      <Head>
        <title>Login ▫ Instagram</title>
        <meta name="description" content="Edited and modified by vaibhav And nagesh " />
        <link rel="icon" href="/insta.ico" />
      </Head>
      <button type="button" onClick={() => router.push('/Login')}>
      Click me
    </button> 
      <div className="login">first div</div>
      <div className="signup">Sign up</div>
      <div className="download">Get app</div>
      <div className="footer">Footer</div>
    
    </>


  )
}
