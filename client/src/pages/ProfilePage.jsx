import React, { useContext, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ProfilePage = () => {

  const [selectedImage, setSelectedImage] = useState(null)
  const navigate = useNavigate()
  const {authUser, updateProfile} = useContext(AuthContext)
  const [name, setName] = useState(authUser?.fullName || "")
  const [bio, setBio] = useState(authUser?.bio || "")

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    let profilePic;

      if(selectedImage.size>5*1024*1024){
        toast.error("Image should be less than 5mb")
        return
      }

    if (selectedImage) {
      profilePic = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
    }

    await updateProfile({
      fullName: name,
      bio,
      profilePic,
    });

    navigate("/");
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg'>Profile Details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input onChange={(e)=>setSelectedImage(e.target.files[0])} type="file" id="avatar" accept='.png, .jpg, .jpeg' hidden />
            <img src={selectedImage ? URL.createObjectURL(selectedImage) : assets.avatar_icon} alt="" className={`w-12 h-12 ${selectedImage && 'rounded-full'}`} />
            Upload profile image
          </label>
          <input 
            onChange={(e)=>setName(e.target.value)}
            value={name}
            type="text" 
            placeholder='Your name' 
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'/>
            <textarea 
              onChange={(e)=>setBio(e.target.value)}
              value={bio}
              placeholder='Write bio for profile' 
              required
              rows={4}
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
              ></textarea>
            <button className='bg-linear-to-r from-purple-400 to-voilet-600 text-white p-2 rounded-full text-lg cursor-pointer' type="submit">Save</button>
        </form>
        <img src={authUser?.profilePic || assets.logo_icon} className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImage && 'rounded-full'}`} alt="" />
      </div>
    </div>
  )
}

export default ProfilePage
