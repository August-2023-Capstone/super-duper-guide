/** @format */

import { useState, useEffect } from "react";
import Select from "react-select";
import Switch from "react-switch";
import supabase from "../../../supabase";
import AvatarModal from "./AvatarModal";
import AddGameModal from "./AddGameModal";

const timezones = [
  "Eastern (UTC-5)",
  "Central (UTC-6)",
  "Mountain (UTC-7)",
  "Pacific (UTC-8)",
];

const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    platform: {
      pc: false,
      playstation: false,
      xbox: false,
      switch: false,
    },
    gamertag: "",
    timezone: "",
  });

  useEffect(() => {
    async function fetchUserProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("pc, playstation, xbox, switch, gamertag, timezone")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
        } else {
          setFormData((prevData) => ({
            ...prevData,
            platform: {
              pc: data.pc,
              playstation: data.playstation,
              xbox: data.xbox,
              switch: data.switch,
            },
            gamertag: data.gamertag,
            timezone: data.timezone,
          }));
        }
      }
    }

    fetchUserProfile();
  }, []); // Empty dependency array means this effect runs once after the component mounts
  //Modal stuff
  const [showModal, setShowModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveAvatar = (avatar) => {
    setSelectedAvatar(avatar);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const [showGameModal, setShowGameModal] = useState(false);
  const openModal = () => {
    setShowGameModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowGameModal(false);
  };

  const platformOptions = [
    { value: "pc", label: "PC" },
    { value: "playstation", label: "Playstation" },
    { value: "xbox", label: "Xbox" },
    { value: "switch", label: "Nintendo Switch" },
  ];

  const togglePlatform = async (platform) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user.id;

    // Fetch the current platform value
    const { data, error } = await supabase
      .from("profiles")
      .select(platform)
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching platform data:", error);
      return;
    }

    // Toggle the platform value
    const updatedValue = !data[platform];
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ [platform]: updatedValue })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating platform value:", updateError);
    } else {
      // Update the form data state
      setFormData((prevData) => ({
        ...prevData,
        platform: {
          ...prevData.platform,
          [platform]: updatedValue,
        },
      }));
    }
  };

  const handlePlatformChange = async (platform) => {
    try {
      // Fetch the user's profile data
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user.id;

      // Fetch the current platform value
      const { data, error } = await supabase
        .from("profiles")
        .select(platform)
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching platform data:", error);
        return;
      }

      // Toggle the platform value
      const updatedValue = !data[platform];
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ [platform]: updatedValue })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating platform value:", updateError);
      } else {
        // Update the form data state
        setFormData((prevData) => ({
          ...prevData,
          platform: {
            ...prevData.platform,
            [platform]: updatedValue,
          },
        }));
      }
    } catch (error) {
      console.error("Error handling platform change:", error);
    }
  };

  const updateGamertagInDatabase = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ gamertag: formData.gamertag })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating gamertag:", error);
      } else {
        console.log("Gamertag updated successfully:", data);
      }
    } catch (error) {
      console.error("Error updating gamertag:", error);
    }
  };
  const updateTimezoneInDatabase = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ timezone: formData.timezone })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating timezone:", error);
      } else {
        console.log("timezone updated successfully:", data);
      }
    } catch (error) {
      console.error("Error updating timezone:", error);
    }
  };
  return (
    <form className="createUserForm form">
      {platformOptions.map((platformOption) => (
        <div key={platformOption.value} className="checkboxConainer">
          <label>
            {platformOption.label}
            <Switch
              onChange={() => handlePlatformChange(platformOption.value)}
              checked={formData.platform[platformOption.value]}
            />
          </label>
        </div>
      ))}

      <br />
      <label>Gamertag:</label>
      <input
        type="text"
        name="gamertag"
        value={formData.gamertag}
        onChange={handleChange}
        placeholder="Enter your gamertag"
      />
      <label>Timezone:</label>
      <select name="timezone" value={formData.timezone} onChange={handleChange}>
        <option value="">Choose your timezone</option>
        {timezones.map((timezone) => (
          <option key={timezone} value={timezone}>
            {timezone}
          </option>
        ))}
      </select>
      <button className="OpenModalButton" type="button" onClick={openModal}>
        Add games
      </button>

      {/* Show the AddGameModal when showModal is true  */}
      {showGameModal && <AddGameModal closeModal={closeModal} />}
      <br />
      <label>Choose your avatar:</label>
      <div className="selected-avatar">
        {selectedAvatar && (
          <img
            src={selectedAvatar.image}
            alt={selectedAvatar.label}
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        )}
      </div>

      <button className="AvatarButton" type="button" onClick={handleOpenModal}>
        Select Avatar
      </button>
      {/* Show the AvatarModal when showModal is true */}
      {showModal && (
        <div className="modal-overlay">
          <AvatarModal onClose={handleCloseModal} onSave={handleSaveAvatar} />
        </div>
      )}
      <br />
      <button
        className="CreateAccountButton"
        type="button"
        onClick={() => {
          updateGamertagInDatabase();
          updateTimezoneInDatabase();
        }}
      >
        Submit{" "}
      </button>
    </form>
  );
};

export default CreateUserForm;
