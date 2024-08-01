import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { useSession, signIn, signOut, getSession } from "next-auth/react";

import useServiceWorker from "../notifications/usePushNotifications";
import Image from 'next/image';


function Login(props) {

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

const { data: session }: any = useSession<any>();




useEffect(() => {
  try {
     subscribe();
  } catch (err) {
    alert("There was an error enabling notifications.");
  }
},[])



const {
  userSubscription,
  notificationsEnabled,
  isMobile,
  isStandalone,
  notificationsSupported,
  isLoadingSubscription,
  subscribe,
} = useServiceWorker({ vapidPublicKey });





return (
<>



<div className="flex flex-col justify-center mt-16">
<Image className="mx-auto mb-8" src="/images/logo.png" alt="logo" width={200} height={200} />

<h1 className="text-6xl font-bold text-amber-500 text-center">RuFREErn</h1>


<div className="my-4"></div>

<h2 className="text-black text-center text-3xl font-bold">Login</h2>

<div className="justify-center flex flex-col w-auto mx-auto" >
<div className="my-8"></div>



{/* <button className="bg-amber-500 text-white text-2xl rounded-full py-2 w-fit px-8 mx-auto hover:opacity-90 active:opacity-80  " onClick={() => signIn("google", { callbackUrl: "/profile" })}>Google Login</button> */}

<button onClick={() => signIn("google", { callbackUrl: "/profile" })} className="px-6 py-4 border flex gap-2 border-slate-700 rounded-lg text-slate-900 font-bold  hover:scale-110 active:scale-100 hover:bg-black hover:text-white active:bg-black active:text-white  hover:opacity-90 active:opacity-70 transition duration-150 w-full">
        <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
        <span>Login with Google</span>
    </button>
</div>

</div>




</>


  )


}



export default Login