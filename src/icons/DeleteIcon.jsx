import React from 'react'
import { FaTrash } from "react-icons/fa";

const DeleteIcon = ({onClick=()=>{}, className}) => {
  return (
    <FaTrash className={`cursor-pointer text-red-500 ${className}`} onClick={onClick} />
  )
}

export default DeleteIcon
