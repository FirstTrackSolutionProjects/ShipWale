import React from 'react'
import CloseIcon from '@mui/icons-material/Close'
const DisableIcon = ({onClick=()=>{}}) => {
  return (
    <CloseIcon fontSize="small" className='cursor-pointer text-red-500' onClick={onClick} />
  )
}

export default DisableIcon
