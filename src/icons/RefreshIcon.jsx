import React from 'react'
import RefIcon from '@mui/icons-material/Refresh';
const RefreshIcon = ({onClick=()=>{}}) => {
  return (
    <RefIcon fontSize="small" color='primary' className='cursor-pointer' onClick={onClick} />
  )
}

export default RefreshIcon
