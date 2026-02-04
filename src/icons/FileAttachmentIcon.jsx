import React from 'react'
import AttachFileIcon from "@mui/icons-material/AttachFile";
const FileAttachmentIcon = ({onClick=()=>{}}) => {
  return (
    <AttachFileIcon fontSize="small" className='cursor-pointer' onClick={onClick} />
  )
}

export default FileAttachmentIcon
