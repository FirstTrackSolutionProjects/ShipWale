import React from 'react'
import { GoShieldLock } from "react-icons/go";

const PermissionIcon = ({onClick=()=>{}}) => {
  return (
    <GoShieldLock className='cursor-pointer' onClick={onClick} />
  )
}

export default PermissionIcon
