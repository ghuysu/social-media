import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [infor, setInfor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(
          `https://skn7vgp9-10000.asse.devtunnels.ms/api/${userId}`,
          {
            method: 'GET',
            headers: {
              'x-api-key': 'abc-xyz-www',
            },
          },
        );

        const data = await response.json();

        if (response.ok) {
          setInfor(data.metadata);
        } else {
          if (data.statusCode === 400 || data.statusCode === 404) {
            navigate('/404');
          }
        }
      } catch (error) {
        console.log(error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId, navigate]);

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  const handleOpenWeb = () => {
    const { _id, fullname, profileImageUrl } = infor;
    const url = `http://localhost:3002?_id=${_id}&fullname=${encodeURIComponent(fullname)}&profileImageUrl=${encodeURIComponent(profileImageUrl)}`;
    window.location.href = url; // Redirect to the web page with user info
  };

  const handleOpenApp = () => {
    const { _id, fullname, profileImageUrl } = infor;
    const deepLinkUrl = `app://add.friend.skyline/${_id}/${encodeURIComponent(fullname)}/${encodeURIComponent(profileImageUrl)}`;
    window.location.href = deepLinkUrl; // Redirect to the mobile app
  };

  return (
    <div className="bg-gradient-to-b from-black via-[#16263c] to-[#22272E] h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center">
          <div className="rounded-full border-[5px] border-[#2593a7]">
            <img
              className="m-[5px] w-32 h-32 rounded-full"
              src={infor.profileImageUrl}
              alt="Profile"
            />
          </div>
        </div>
        <p className="text-[#E8E8E6] mt-4 bold text-[28px]">
          Add {infor.fullname} on Skyline
        </p>
        <p className="text-gray-400 bold mt-4">
          Pics from your best friends on <br />
          your Home Screen
        </p>
        <div className="mt-4">
          <button
            className="bg-[#27A3B9] text-white bold px-5 py-3 rounded-2xl mr-4"
            onClick={handleOpenApp}
          >
            Open on app
          </button>
          <button
            className="bg-[#526669] text-white bold px-5 py-3 rounded-2xl"
            onClick={handleOpenWeb}
          >
            Open on web
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
