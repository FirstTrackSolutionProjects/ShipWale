import React from 'react'
import CloseIcon from '@mui/icons-material/Close'
const ClearFieldIcon = ({onClick=()=>{}}) => {
  return (
    <CloseIcon fontSize="small" className='cursor-pointer' onClick={onClick} />
  )
}

export default ClearFieldIcon
