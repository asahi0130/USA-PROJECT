import Head from "next/head";
import React, { useState, useEffect, use } from "react";
import axios from "axios";
import { GetServerSideProps } from "next";
import { useSession, signIn, signOut, getSession } from "next-auth/react";
import useServiceWorker from "../notifications/usePushNotifications";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import {
  parseISO,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,

} from "date-fns";

import {format} from "date-fns-tz"
import Image from "next/image";


function Index(props) {
  const dist = 100;
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const router = useRouter();
  const { data: session }: any = useSession<any>();
  const [recommendedUser, setrecommendedUser] = useState<any>(null);
  const {
    userSubscription,
    notificationsEnabled,
    isMobile,
    isStandalone,
    notificationsSupported,
    isLoadingSubscription,
    subscribe,
  } = useServiceWorker({ vapidPublicKey });


  const [loadingFriends, setLoadingFriends] = useState(true);
  const [addFriend, setAddFriend] = useState(false);
  const [viewFriend, setViewFriend] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [friendData, setFriendData] = useState<any>([]);
  const [friendLocation, setFriendLocation] = useState<any>([]);
  const [userLocationTime, setUserLocationTime] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);




  const calculateTimeAgo = (time) => {
    const locationTime = parseISO(time);
    const now = new Date();

    const minutesDiff = differenceInMinutes(now, locationTime);
    const hoursDiff = differenceInHours(now, locationTime);
    const daysDiff = differenceInDays(now, locationTime);

    if (daysDiff > 0) {
      return `${daysDiff} day${daysDiff > 1 ? "s" : ""} ago`;
    } else if (hoursDiff > 0) {
      return `${hoursDiff} hour${hoursDiff > 1 ? "s" : ""} ago`;
    } else {
      return `${minutesDiff} minute${minutesDiff > 1 ? "s" : ""} ago`;
    }
  };

  const isMoreThanTenMinutesAgo = (timeAgo) => {
    const minutesDiff = timeAgo.match(/(\d+) minute/);
    const hoursDiff = timeAgo.match(/(\d+) hour/);
    const daysDiff = timeAgo.match(/(\d+) day/);
  
    if (daysDiff || hoursDiff) {
      return true;
    } else if (minutesDiff) {
      return parseInt(minutesDiff[1], 10) > 10;
    }
    return false;
  };


  const calculateMinutesAgo = (time) => {
    const locationTime = parseISO(time);
    const now = new Date();
  
    const minutesDiff = differenceInMinutes(now, locationTime);
    return minutesDiff;
  };


  const getUserLocation = () => {
    // if geolocation is supported by the users browser
    if (navigator.geolocation) {
      // get the current users location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // save the geolocation coordinates in two variables
          const { latitude, longitude } = position.coords;
          // update the value of userlocation variable
          setUserLocation({ latitude, longitude });
        },
        // if there was an error getting the users location
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
    // if geolocation is not supported by the users browser
    else {
      console.error("Geolocation is not supported by this browser.");
    }
  };



  async function searchFriend() {
    toast.loading("Searching...", {
      id: "search", // Use the unique ID for the toast
      duration: 2500,
      style: {
        background: "white",
        color: "blue",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });
    const response = await axios.post("/api/searchFriend", {
      email: session?.user?.email,
    });
    const matchingUser = response.data.data;
    setrecommendedUser(matchingUser);
    toast.dismiss("search");
  }

  async function updateLocation() {





    toast.loading("Updating...", {
      id: "updating", // Use the unique ID for the toast
      duration: 2500,
      style: {
        background: "white",
        color: "blue",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });

    await getUserLocation();

    try {
      const response = await axios.post("/api/updateLocation", {
        email: session?.user?.email,
        lat: userLocation.latitude,
        long: userLocation.longitude,
        time: new Date().toISOString()
      });
      console.log("Location updated successfully:", response.data);

      setUserLocationTime({
        lat: userLocation.latitude,
        long: userLocation.longitude,
        time: format(new Date(), "yyyy-MM-dd HH:mm:ssXXX", {
          timeZone: "Asia/Tokyo",
        }),
      });
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
    } catch (error) {
      console.error("Error updating location:", error);
      toast("Error", {
        icon: "⚠️",
        duration: 750,
        style: {
          background: "white",
          color: "red",
          fontWeight: "bolder",
          fontSize: "17px",
          padding: "20px",
        },
      });
    } finally {
      toast.dismiss("updating");
    }

var notify:any = [];
for (let i = 0; i < friendLocation.length; i++) {

if (calculateMinutesAgo(friendLocation[i].time) < 10){
  notify.push(friendLocation[i].email)
}

  }



  let foundFriends:any = [];

  // Loop through notify array to find matching emails in friendData
  for (let i = 0; i < notify.length; i++) {
    for (let j = 0; j < friendData.length; j++) {
      if (friendData[j].email === notify[i]) {
        foundFriends.push(friendData[j]);
        break; // Exit the inner loop once a match is found
      }
    }
  }
  
  // foundFriends now contains the data of friends to be notified
  console.log(foundFriends);

for (let i = 0; i < foundFriends.length; i++) {

  try {
    const response = await axios.post(
      "/api/send-notification",
      {
        title: "RuFREErn",
        body: userData.name + " is free!",
        subscription: JSON.parse(foundFriends[i].noti),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        httpsAgent: new (require("https").Agent)({
          rejectUnauthorized: false,
        }),
      }
    );
    console.log("Notification sent successfully:", response.data);

    toast.success("Notified: " + foundFriends[i].name, {
      duration: 1500,
      style: {
        background: "white",
        color: "green",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });

  } catch (error) {

    toast.error(foundFriends[i].name + " does not have notifications enabled", {
      duration: 1500,
      style: {
        background: "white",
        color: "red",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });
    console.error("Error sending notification:", error);
  }


}

}




  async function addFriendToDB() {
    toast.loading("Adding...", {
      id: "adding", // Use the unique ID for the toast
      duration: 2500,
      style: {
        background: "white",
        color: "blue",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });
    // Get the user's email from session and the friend's email from the input field
    const userEmail = session.user.email;
    var friendEmail = document?.getElementById(
      "friendID"
    ) as HTMLInputElement | null;
    var friend = "";
    if (friendEmail) {
      friend = friendEmail.value;
    } else {
      console.error("Friend email input not found");
      toast.dismiss("adding");
      return;
    }

    try {
      // Make a POST request to the /api/addFriend endpoint
      const response = await axios.post("/api/addFriend", {
        email: userEmail,
        friend: friend,
      });

      // Handle the response
      if (response.status === 200) {
        console.log("Friend added successfully:", response.data);
        toast.dismiss("adding");

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

        friendEmail.value = "";
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Delay for 1 second
      } else {
        console.error("Failed to add friend:", response.data.message);
        toast.dismiss("adding");

        toast("Error", {
          icon: "⚠️",
          duration: 750,
          style: {
            background: "white",
            color: "red",
            fontWeight: "bolder",
            fontSize: "17px",
            padding: "20px",
          },
        });
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.dismiss("adding");

      toast("Error", {
        icon: "⚠️",
        duration: 750,
        style: {
          background: "white",
          color: "red",
          fontWeight: "bolder",
          fontSize: "17px",
          padding: "20px",
        },
      });
    }
  }





  function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    var d = R * c; // Distance in km
    return Math.round(d * 1000); // Distance in m
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }
  



  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.post("/api/getUser", {
          email: session?.user?.email,
        });

        setUserData(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();
  }, [session]);

  useEffect(() => {
    setLoadingFriends(true);
    if (viewFriend == false) {
      return;
    }

    const fetchUserData = async () => {

      try {
        const response = await axios.post("/api/getUser", {
          email: session?.user?.email,
        });

        setUserData(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };



    const fetchFriendData = async (f) => {
      setFriendData([]);
      try {
        const response = await axios.post("/api/getUser", {
          email: f,
        });
        setFriendData((oldArray) => [...oldArray, response.data.data]);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchFriendLocation = async (f) => {
      setFriendLocation([]);
      try {
        const response = await axios.post("/api/getLocation", {
          email: f,
        });
        setFriendLocation((oldArray) => [...oldArray, response.data.data]);
      } catch (err) {
        console.error(err);
      } 
    };

    const fetchLocation = async () => {
      try {
        const response = await axios.post("/api/getLocation", {
          email: session?.user?.email,
        });

        setUserLocationTime({
          lat: response.data.data.lat,
          long: response.data.data.long,
          time: response.data.data.time,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFriends(false);
      }
    };

    if (userData) {
      userData.friends.forEach((f) => {
        // xxxxx
        console.log("fetching");
        fetchFriendLocation(f);
        fetchFriendData(f);
      });
    } else {
      fetchUserData();
    }

    fetchLocation();
  }, [viewFriend, userData]);

  useEffect(() => {
    setrecommendedUser(null);
  }, [addFriend]);


  

  useEffect(() => {
    try {
      subscribe();
    } catch (err) {
      alert("There was an error enabling notifications.");
    } finally {
      const fetchUserData = async () => {
        try {
          const response = await axios.post("/api/addUserNoti", {
            email: session?.user?.email,
            noti: userSubscription,
          });


          console.log("Notification enabled successfully:", response.data);
        } catch (err) {
          console.error(err);
        }
      };

      //XXXXXX
      fetchUserData();

      try {
        getUserLocation();
      } catch (err) {
        console.error(err);
      }
    }
  }, [session]);

  useEffect(() => {
    // Function to remove duplicates based on email
    const removeDuplicates = (data) => {
      const uniqueEmails = new Set();
      return data.filter((friend) => {
        if (uniqueEmails.has(friend.email)) {
          return false;
        } else {
          uniqueEmails.add(friend.email);
          return true;
        }
      });
    };

    // Deduplicated friendData
    const deduplicatedFriendData = removeDuplicates(friendData);

    // Only update the state if there are changes
    if (deduplicatedFriendData?.length !== friendData?.length) {
      setFriendData(deduplicatedFriendData);
    }
  }, [friendData]);

  return (
    <>
      <Toaster position="bottom-right" />

      <section>
        <div className="flex flex-col justify-center my-16">
          <Image className="mx-auto mb-8" src="/images/logo.png" alt="logo" width={200} height={200} />
          <h1 className="text-4xl font-bold text-amber-500 text-center">
            RuFREErn
          </h1>

          <div className="mt-16"></div>

          <button
            id="addFriend"
            className="bg-amber-500 text-lg py-4 px-8 rounded-full text-center items-center text-white w-48 mx-auto hover:opacity-90 active:opacity-70 "
            onClick={() => setAddFriend(!addFriend)}
          >
            Add Friend
          </button>

          <div className="my-8"></div>

          <button
            id="viewFriend"
            className="bg-amber-500 text-lg py-4 px-8 rounded-full text-center items-center text-white w-48 mx-auto hover:opacity-90 active:opacity-70 "
            onClick={() => setViewFriend(!viewFriend)}
          >
            View Friend
          </button>
          <div className="my-6"></div>

          {/* <div className=" flex justify-center">
<p>Active</p>
</div>
<div className=" flex justify-center">
<label className="switch" htmlFor="checkbox">
    <input type="checkbox" id="checkbox" />
    <div className="slider round"></div>
</label>
</div> */}



<div className=" bottom-24 flex flex-row justify-center font-bold text-lg right-0 left-0 m-auto  text-black text-center">
            <Link className="hover:underline active:opacity-80" href="/profile">
              ID:&nbsp;{session?.user?.email}
            </Link>
          </div>

          <button
            onClick={() => signOut()}
            className=" bottom-12 flex flex-row justify-center text-md right-0 left-0 m-auto w-fit text-black text-center hover:cursor-pointer hover:underline active:opacity-80"
          >
            LOGOUT
          </button>
        </div>

        {/* MODALS */}
        <div
          id="addpopup"
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${
            addFriend == false ? "hidden" : ""
          }`}
        >
          <div className="relative bg-orange-300 px-4 py-16  shadow-lg w-11/12 text-center">
            <button
              id="addclosePopup"
              className="absolute top-4 right-4 bg-white text-lg w-8 h-8 rounded-full text-gray-600 hover:opacity-90 active:opacity-70"
              onClick={() => setAddFriend(!addFriend)}
            >
              &#10006;
            </button>

            <div className="bg-white p-2 rounded-3xl shadow-lg w-full text-center">
              <p
                id="popupMessage"
                className="my-4 text-amber-500 text-4xl font-bold mb-4"
              >
                Add Friend
              </p>

              <div className="my-12"></div>

              <input
                type="text"
                className=" w-11/12 p-2 border-2 border-gray-300 rounded-lg"
                placeholder="enter email..."
                id="friendID"
              />

              <div className="my-12"></div>

              <button
                onClick={() => addFriendToDB()}
                id="addFriendButton"
                className="bg-amber-500 text-lg py-2 px-4 rounded-full text-white hover:opacity-90 active:opacity-70"
              >
                Add Friend
              </button>

              <div className="my-16"></div>
              <button
                onClick={() => searchFriend()}
                id="addFriendButton"
                className="bg-amber-500 text-lg py-2 px-4 rounded-full text-white hover:opacity-90 active:opacity-70"
              >
                Look For Friend
              </button>
              <div className="my-16"></div>

              {recommendedUser == null ? (
                ""
              ) : (
                <>
                  <div className="flex flex-row justify-between md:justify-center md:gap-x-8 items-center text-orange-400 border-b-2 border-white py-4  ">
                    <div className="flex flex-col  mx-auto ">
                      <p className="text-center text-2xl">Recommended Friend</p>

                      <div className="flex flex-row">
                        <h3 id="name">Name: {recommendedUser.name}</h3>
                      </div>
                      <div className="flex flex-row">
                        <h4>Email:&nbsp;</h4>
                        <p className="" id="userid">
                          {recommendedUser.email}
                        </p>
                      </div>
                      <div className="flex flex-row">
                        <h4>Social:&nbsp;</h4>
                        <p className="" id="userid">
                          {recommendedUser.social}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          id="viewpopup"
          className={`py-16 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-auto ${
            viewFriend == false ? "hidden" : ""
          }`}
        >
          <div className="relative bg-orange-300 px-3 py-16 shadow-lg w-11/12 max-h-screen overflow-y-auto text-center">
            <button
              id="viewclosePopup"
              className="absolute top-4 right-4 bg-white text-lg w-8 h-8 rounded-full text-gray-600 hover:opacity-90 active:opacity-70"
              onClick={() => setViewFriend(!viewFriend)}
            >
              &#10006;
            </button>
            <div className="p-4 w-full text-center">
              <p id="popupMessage" className="text-white text-4xl font-bold">
                Friends List
              </p>

              {loadingFriends ? (<>
              
                <div className="fixed top-0 left-0 z-50 w-screen h-screen bg-white opacity-75 flex items-center justify-center">
  <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
</div>


              </>) : (<>
              <p
                id="popupMessage"
                className="text-white text-sm font-bold mb-4"
              >
                {userData ? `(${userData.friends.length})` : ""}
              </p>

              {userLocationTime == null ? (
                ""
              ) : (
                <>
                  <div className="my-8"></div>
                  <div>
                    <p>{userLocationTime.lat}</p>
                    <p>{userLocationTime.long}</p>
                    <p className={`${isMoreThanTenMinutesAgo(userLocationTime.time) ? 'text-red-600' : 'text-green-600'}`} id="time">
                      {calculateTimeAgo(userLocationTime.time)}</p>
                  </div>
                </>
              )}

              <div className="my-8"></div>

              <button
                onClick={() => updateLocation()}
                className="bg-white text-orange-400 px-2 py-1 rounded-xl hover:opacity-90 active:opacity-80"
              >
                Update Location
              </button>

        <div className="flex flex-col">

          {/* <button
            className={`text-xl items-center bg-[#215960] text-white py-2 rounded  mx-auto px-4
        }`}
            onClick={async (e) => {
              if (!userSubscription || !notificationsEnabled) {
                alert("Please enable notifications.");
              } else {
                try {
                  const response = await axios.post(
                    "/api/send-notification",
                    {
                      title: "RuFREErn",
                      body: userData.name + " is free!",
                      subscription: JSON.parse(userSubscription),
                    },
                    {
                      headers: {
                        "Content-Type": "application/json",
                      },
                      httpsAgent: new (require("https").Agent)({
                        rejectUnauthorized: false,
                      }),
                    }
                  );
                  console.log("Notification sent successfully:", response.data);
                } catch (error) {
                  console.error("Error sending notification:", error);
                }
              }
            }}
          >
            <span className="col-span-2  text-start ">
              Send Test Notification
            </span>
          </button> */}
        </div>

        </>)}


              <div className="my-8"></div>

              {loadingFriends ? (
                <div className="fixed top-0 left-0 z-50 w-screen h-screen bg-white opacity-75 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
                </div>
              ) : (
                ""
              )}

              {friendData &&
                friendData.map((friend: any, index) => {
                  const location = friendLocation.find(
                    (loc: any) => loc.email === friend.email
                  );
                  const timeAgo = location
                    ? calculateTimeAgo(location.time)
                    : "N/A";
                    const isOld = isMoreThanTenMinutesAgo(timeAgo);

                  return (
                    <div
                      key={index}
                      className="flex flex-row md:justify-center items-center text-white border-b-2 border-white py-4"
                    >
                      <img src="images/person.svg" alt="person" />
                      <div className="flex flex-col text-left whitespace-nowrap">
                        <h3 id="name">{friend.name}</h3>
                        <div className="text-xs flex flex-row">
                          <h4>Email:&nbsp;</h4>
                          <p className="" id="userid">
                            {friend.email}
                          </p>
                        </div>
                        <div className="text-xs flex flex-row">
                          <h4>Time:&nbsp;</h4>
                          <p className={`${isOld ? 'text-red-600' : 'text-green-600'}`} id="time">

                            {timeAgo}
                          </p>
                        </div>
                      </div>

                      <div>
                        {location && userLocationTime ? (<>
                          <p className={`ml-4 rounded-full bg-white px-4 py-2 ${getDistanceFromLatLonInM(userLocationTime.lat, userLocationTime.long, location.lat, location.long) < dist ? ("text-green-400") : ("text-red-400")}`}>
                            {getDistanceFromLatLonInM(userLocationTime.lat, userLocationTime.long, location.lat, location.long)}m
                        </p>
                        
                        </>) : (<>
                        
                          <p className="ml-4 rounded-full bg-white px-4 py-2 text-red-400">

                            N/A
                        </p>
                        
                        </>)}
       
                      </div>
                    </div>
                  );
                })}

              <div className="my-16"></div>
            </div>
          </div>
        </div>
      </section>

  
    </>
  );
}

export default Index;

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  // const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  // const host = context.req.headers.host;
  // const currentUrl = `${protocol}://${host}`;

  if (!session) {
    return {
      redirect: {
        destination: `/login`,
      },
    };
  }

  return {
    props: { session },
  };
};
