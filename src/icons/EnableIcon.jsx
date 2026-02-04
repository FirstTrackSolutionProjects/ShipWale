import React from 'react'
import DoneIcon from '@mui/icons-material/Done';
const EnableIcon = ({onClick=()=>{}}) => {
  return (
    <DoneIcon fontSize="small" className='cursor-pointer text-green-500' onClick={onClick} />
  )
}

export default EnableIcon
