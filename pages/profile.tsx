import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import toast, { Toaster } from "react-hot-toast";
import { useSession, signIn, signOut, getSession } from "next-auth/react";
import useServiceWorker from "../notifications/usePushNotifications";
import { useRouter } from 'next/router';
import { connectToDatabase } from '../lib/mongodb';





function Profile(props) {

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const { data: session }: any = useSession<any>();




const router = useRouter();
const [email, setEmail] = useState(session?.user?.email);

const [name, setName] = useState('');
const [social, setSocial] = useState( '');
const [intro, setIntro] = useState('');
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

useEffect(() => {

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/getUser", {
        email: session?.user?.email,
      });
      setData(response.data.data);
      console.log(response.data.data)
      setName(response.data.data.name);
      setSocial(response.data.data.social);
      setIntro(response.data.data.intro);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);

    }
  };

  fetchUserData();

}, [session]);


const handleSave = () => {
  const userData = {
    name: name,
    email: session?.user?.email,
    social: social,
    intro: intro,
    friends: [],  // Example of handling array inputs or set some default
  };
  toast.loading("Saving...", {
    id: 'saving', // Use the unique ID for the toast
    duration: 2500,
    style: {
      background: "white",
      color: "blue",
      fontWeight: "bolder",
      fontSize: "17px",
      padding: "20px",
    },
  });


  
  addUser(userData).then(data => {
    console.log('User added successfully:', data);
    toast.success("Success!", {
      duration: 750,
      style: {
        background: "white",
        color: "green",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });
    setTimeout(() => {
      router.push('/');
    }, 1500);  // Delay for 1 second



  }).catch(error => {
    toast("Error", {
      icon: '⚠️',
      duration: 750,
      style: {
        background: "white",
        color: "red",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });
  }).finally(() => {
    toast.dismiss('saving');
  })
};


async function addUser(userData) {
  const response = await fetch('/api/addUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  console.log(userData)


}




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

console.log(userSubscription)





return (
<>

{loading ? (<>

<div className="fixed top-0 left-0 z-50 w-screen h-screen bg-white opacity-75 flex items-center justify-center">
  <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
</div>
</>) : (<>

</>)}

<Toaster position="bottom-right"/>

<div className="flex flex-col justify-center mt-16 mb-32 ">
<h1 className="text-6xl font-bold text-amber-500 text-center">RuFREErn</h1>

<div className="my-4"></div>

<h2 className="text-black text-center text-3xl font-bold">Profile</h2>

<div className="justify-center flex flex-col w-5/6 mx-auto" >
<div className="my-4"></div>
<label htmlFor='name' className="text-black text-left text-lg font-bold">Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full justify-center p-2 border-2 border-gray-300 rounded-lg" placeholder="Keio Taro" id="name" />

          <div className="my-4"></div>
          <label htmlFor='email' className="text-black text-left text-lg font-bold">Email:</label>
          <input type="email" value={session?.user?.email} disabled  className="w-full justify-center p-2 border-2 border-gray-300 rounded-lg" placeholder="sample@gmail.com" id="email" />

          <div className="my-4"></div>
          <label htmlFor='social' className="text-black text-left text-lg font-bold">Social Media:</label>
          <input type="text" value={social} onChange={(e) => setSocial(e.target.value)} className="w-full justify-center p-2 border-2 border-gray-300 rounded-lg" placeholder="Insta: @keio_university" id="social" />

          <div className="my-4"></div>
          <label htmlFor='intro' className="text-black text-left text-lg font-bold">Introduction:</label>
          <textarea rows={5} value={intro} onChange={(e) => setIntro(e.target.value)} className="w-full justify-center p-2 border-2 border-gray-300 rounded-lg" placeholder="Introduce yourself!" id="intro" />

          <div className="my-6"></div>
          <button className="bg-amber-500 text-white text-2xl rounded-full py-2 w-fit px-8 mx-auto hover:opacity-90 active:opacity-80"
            onClick={handleSave}
          >
            Save
          </button>


</div>

</div>
</>
  )
}



export default Profile

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: `/login`,
        permanent: false,
      },
    };
  }

  // try {
  //   const { db } = await connectToDatabase();
  //   const email = session?.user?.email; 


  //   const user = await db.collection('users').findOne({ email: email });
  //   if (!user) {
  //     // Handle case where no user is found
  //     return {
  //       props: {
  //         userData: null,
  //         session,
  //       },
  //     };
  //   }

  //   // Only pass necessary user data to the client to avoid exposing sensitive information
  //   const userData = {
  //     name: user.name,
  //     social: user.social,
  //     intro: user.intro,
  //   };

  //   return {
  //     props: {
  //       userData,
  //       session,
  //     },
  //   };
  // } catch (error) {
    // Handle potential errors in MongoDB operation
    return {
      props: {

        // userData: null,
        session,
      },
    };
  // }
};