import { Box, Button, TextField } from "@mui/material"
import { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { toast } from "react-toastify"

const API_URL = import.meta.env.VITE_APP_API_URL

const ForgotPasswordModal = ({onClose}) => {
    const INITIAL_STATE = {
        email : '',
        otp : '',
        newPassword : '',
        confirmNewPassword : ''
    }
    const [formData, setFormData] = useState(INITIAL_STATE)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const handleOtp = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/password/forgot/otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({email : formData.email}),
        }).then(response => response.json()).then(result => {
          if (result.success) {
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        })
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
        }).then(response => response.json()).then(result => {
          if (result.success) {
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        })
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md max-h-screen overflow-hidden relative">
          <button
            className="absolute top-2 right-6 z-50 text-gray-400 hover:text-gray-600 text-3xl"
            onClick={onClose}
          >
            ×
          </button>
          <div className="w-full p-4 overflow-y-auto max-h-[80vh]">
          <div className='w-full p-8 flex flex-col items-center relative'>
        
        <div className='text-center text-3xl font-medium text-black mb-8'>Reset your password</div>
        <form action="" onSubmit={handleSubmit} className="w-full sm:w-auto flex px-3 flex-col mt-3 space-y-3 sm:space-y-5 text-black">
            <TextField type="email" size="small" placeholder="Email Address" value={formData.email} onChange={handleChange} name="email" className="py-2 px-3 border-black rounded-xl flex-1 sm:w-[400px]" />
            <div className='flex flex-1 space-x-2'>
            <TextField type="text" size="small" placeholder="OTP" name="otp" value={formData.otp} onChange={handleChange} className="py-2 px-3 rounded-xl border-black w-[180px] sm:w-[284px]"/>
                <Button type="button" onClick={handleOtp} disabled={!formData.email} variant="contained" sx={{fontSize: '10px', fontWeight:''}} >Request OTP</Button>
              </div>
              
              <div className='flex flex-1 space-x-1 justify-between'>
              <TextField type={showPassword?'text':'password'} InputProps={{
                endAdornment: <Box className="h-4 cursor-pointer" onClick={()=>setShowPassword((prev)=>!prev)}>{!showPassword?<FaEye/>:<FaEyeSlash/>}</Box>
              }} size="small" placeholder="New Password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="border-black py-2 px-3 rounded-xl  w-full sm:w-[196px]"/>
              <TextField type={showConfirmPassword?'text':'password'} InputProps={{
                endAdornment: <Box className="h-4 cursor-pointer" onClick={()=>setShowConfirmPassword((prev)=>!prev)}>{!showConfirmPassword?<FaEye/>:<FaEyeSlash/>}</Box>
              }} size="small" placeholder="Confirm Password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} className="py-2 border-black px-3 rounded-xl  w-full sm:w-[196px]"/>
              </div>
              <Button type="submit" variant="contained" className="py-2 px-3 rounded-xl  w-full sm:w-[400px] border border-black  hover:bg-red-300" >Change password</Button>
            </form>
        </div>
          </div>
        </div>
      </div>
  )
}

export default ForgotPasswordModal
