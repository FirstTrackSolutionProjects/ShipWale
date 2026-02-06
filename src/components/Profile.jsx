import React, { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { USER_ROLES } from '@/Constants';
const API_URL = import.meta.env.VITE_APP_API_URL
const Profile = () => {
  const admin = jwtDecode(localStorage.getItem('token')).role === USER_ROLES.ADMIN;
  const INITIAL_STATE = {
    name: '',
    business_name: '',
    email: '',
    phone: '',
    msme: '',
    cin: '',
    gstin: '',
    aadhar: '',
    pan: '',
    address: '',
    hub: '',
    city: '',
    state: '',
    pin: '',
    bank: '',
    account_number: '',
    ifsc: ''
  }
  const [profileData, setProfileData] = useState({
    name: '',
    business_name: '',
    email: '',
    phone: '',
    msme: '',
    cin: '',
    gstin: '',
    aadhar: '',
    pan: '',
    address: '',
    hub: '',
    city: '',
    state: '',
    pin: '',
    bank: '',
    account_number: '',
    ifsc: '',
    designation: '',
  })
  useEffect(() => {
    fetch(`${API_URL}/${admin?'admin':'merchant'}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': localStorage.getItem('token'),
      }
    }).then(response => response.json()).then(result => result.data).then((data) => {
      setProfileData({
        name: data.fullName,
        business_name: data.businessName,
        email: data.email,
        phone: data.phone,
        msme: data.msme,
        cin: data.cin,
        gstin: data.gst,
        aadhar: data.aadhar_number,
        pan: data.pan_aadhar,
        address: data.address,
        city: data.city,
        state: data.state,
        pin: data.pin,
        bank: data.bank,
        account_number: data.accountNumber,
        ifsc: data.ifsc,
        designation: data.designation
      })
    })
  }, [])
  return (
    <div className=" w-full h-full flex flex-col items-center overflow-x-hidden">
      <div className='w-full h-full bg-white p-8 flex flex-col items-center'>
        <div className='text-center text-3xl font-medium text-black mb-8'>{admin ? "Admin" : "Merchant"} Profile</div>
        {/* <div className='sm:px-8 sm:border text-black text-xl flex flex-col space-y-2 items-center'>
        <div className='h-48 flex items-center space-x-4'>
          <div className='h-16 w-16'>
            <img src="user.webp" alt="" className='object-contain' />
          </div>
          <div className='flex-1 sm:text-xl font-medium'>
            <div>{profileData.business_name}</div>
            <div className='text-gray-600 text-sm'>({profileData.name})</div>
          </div>
        </div>
        <div className=' text-sm sm:text-xl space-y-1'>
        <div><span className='font-medium'> E-mail </span> : {profileData.email}</div>
        <div><span className='font-medium'> Phone </span> : {profileData.phone}</div>
        <div><span className='font-medium'> Address </span> : {profileData.address}</div>
        <div><span className='font-medium'> MSME/UDYOG </span> : {profileData.msme}</div>
        <div><span className='font-medium'> CIN </span> : {profileData.cin}</div>
        <div><span className='font-medium'> GSTIN </span> : {profileData.gstin}</div>
        </div>
        <div className=' py-6'>
        <button className="px-5 py-1 border rounded bg-red-500 text-white text-sm sm:text-xl">Edit Details</button>
        </div>
      </div> */}
        <div className=' border-2  relative p-6 max-w-[500px] bg-white rounded-2xl overflow-hidden space-y-8'>
          <div className='w-full space-y-6'>
            <div className='w-full flex items-center justify-center space-x-8'>
              <div className='flex justify-center items-center w-32 h-32'>
                <img src='/image/logo-nobg.png' />
              </div>
              <div className=''>
                <p className='font-medium text-xl'>{profileData.business_name}</p>
                <p className='font-medium text-sm text-gray-600'>({profileData.name})</p>
                <p className='font-medium text-sm text-gray-600'>{profileData.email}</p>
                <p className='font-medium text-sm text-gray-600'>{profileData.phone}</p>
                <p className='font-medium text-sm text-green-400'>Balance(Coming Soon)</p>
              </div>
            </div>
            <div className='w-full font-medium text-gray-700'>
              {(admin && profileData.designation) ? <p>Designation : {profileData.designation}</p> : null}
              {profileData.address && <p>Address : {profileData.address}</p>}
              {!admin && <div className='w-full'>
                {profileData.gstin && <p>GSTIN : {profileData.gstin}</p>}
                {profileData.cin && <p>CIN : {profileData.cin}</p>}
                {profileData.aadhar && <p>Aadhar Number : {profileData.aadhar}</p>}
                {profileData.pan && <p>PAN Number : {profileData.pan}</p>}
                {profileData.hub && <p>Hub : {profileData.hub}</p>}
                {profileData.city && <p>City : {profileData.city}</p>}
                {profileData.state && <p>State : {profileData.state}</p>}
                {profileData.pin && <p>Pincode : {profileData.pin}</p>}
                {profileData.bank && <p>Bank Name : {profileData.bank}</p>}
                {profileData.account_number && <p>A/C No. : {profileData.account_number}</p>}
                {profileData.ifsc && <p>IFSC : {profileData.ifsc}</p>}
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
