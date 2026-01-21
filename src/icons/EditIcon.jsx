import React from 'react'
import { FaPencil } from "react-icons/fa6";
const EditIcon = ({onClick=()=>{}}) => {
  return (
    <FaPencil className='cursor-pointer' onClick={onClick} />
  )
}

export default EditIcon
