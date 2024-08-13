import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";

export default function SetAvatar() {
  const api = `https://api.multiavatar.com/4645646`;
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    const checkAuth = () => {
      if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  // Wrap fetchAvatars with useCallback
  const fetchAvatars = useCallback(async () => {
    try {
      const data = [];
      for (let i = 0; i < 4; i++) {
        const response = await axios.get(`${api}/${Math.round(Math.random() * 1000)}`);
        data.push(response.data);
      }
      setAvatars(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching avatars:", error);
      toast.error("Error fetching avatars. Please try again.", toastOptions);
    }
  }, [api]);

  // Effect that fetches avatars
  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatars[selectedAvatar],
      });

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem(process.env.REACT_APP_LOCALHOST_KEY, JSON.stringify(user));
        navigate("/");
      } else {
        toast.error("Error setting avatar. Please try again.", toastOptions);
      }
    } catch (error) {
      console.error("Error setting avatar:", error);
      toast.error("Error setting avatar. Please try again.", toastOptions);
    }
  };

  return (
    <Container>
      {isLoading ? (
        <img src={loader} alt="loader" className="loader" />
      ) : (
        <>
          <div className="title-container">
            <h1>Pick an avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={`avatar ${
                  selectedAvatar === index ? "selected" : ""
                }`}
              >
                <img
                  src={`data:image/svg+xml;base64,${avatar}`}
                  alt="avatar"
                  onClick={() => setSelectedAvatar(index)}
                />
              </div>
            ))}
          </div>
          <button className="submit-btn" onClick={setProfilePicture}>
            Set as Profile Picture
          </button>
        </>
      )}
      <ToastContainer />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  .title-container {
    h1 {
      color: white;
    }
  }
  .avatars {
    display: flex;
    gap: 1rem;
    .avatar {
      border: 0.4rem solid transparent;
      border-radius: 50%;
      padding: 0.2rem;
      cursor: pointer;
      img {
        height: 6rem;
        width: 6rem;
        border-radius: 50%;
      }
      &.selected {
        border: 0.4rem solid #4e0eff;
      }
    }
  }
  .submit-btn {
    background-color: #4e0eff;
    color: white;
    padding: 0.5rem 2rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
    &:hover {
      background-color: #4e0eff88;
    }
  }
  .loader {
    width: 10rem;
    height: 10rem;
  }
`;
