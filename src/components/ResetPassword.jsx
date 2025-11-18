import React, { useState } from 'react'
const API_URL = import.meta.env.VITE_APP_API_URL
const ResetPassword = ({reset, setReset}) => {
    const INITIAL_STATE = {
        email : '',
        otp : '',
        newPassword : '',
        confirmNewPassword : ''
    }
    const [formData, setFormData] = useState(INITIAL_STATE)

    const handleOtp = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/password/forgot/otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({email : formData.email}),
        }).then(response => response.json()).then(result => alert(result.message))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmNewPassword) {
            alert('New password must match the Confirm new password')
            return;
        }
        await fetch(`${API_URL}/password/forgot/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify(formData),
        }).then(response => response.json()).then(result => alert(result.message))
        setFormData(INITIAL_STATE)
    }
    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  return (
    <div className={`absolute bg-red-100   h-full inset-0 flex flex-col items-center justify-center overflow-hidden`}>
        <p className='absolute top-4 right-6 text-black z-50 cursor-pointer' onClick={()=>setReset(false)}>X</p>
    <div className='max-w-96 p-8 flex flex-col items-center relative'>
        
    <div className='text-center text-3xl font-medium text-black mb-8'>Reset your password</div>
    <form action="" onSubmit={handleSubmit} className="w-full sm:w-auto flex px-3 flex-col mt-3 space-y-3 sm:space-y-5 text-black">
        <input type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} name="email" className="py-2 px-3 border-black rounded-xl flex-1 sm:w-[400px]" />
        <div className='flex flex-1 space-x-2'>
        <input type="text" placeholder="OTP" name="otp" value={formData.otp} onChange={handleChange} className="py-2 px-3 rounded-xl border-black w-[180px] sm:w-[284px]"/>
            <button onClick={handleOtp} className="py-2 px-1 rounded-xl text-sm  w-[100px] border border-black  hover:bg-red-300">Request OTP</button>
          </div>
          
          <div className='flex flex-1 space-x-1 justify-between'>
          <input type="password" placeholder="New Password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="border-black py-2 px-3 rounded-xl  w-full sm:w-[196px]"/>
          <input type="password" placeholder="Confirm New Password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} className="py-2 border-black px-3 rounded-xl  w-full sm:w-[196px]"/>
          </div>
          <button type="submit" className="py-2 px-3 rounded-xl  w-full sm:w-[400px] border border-black  hover:bg-red-300">Change password</button>
        </form>
    </div>
  </div>
  )
}

export default ResetPassword
