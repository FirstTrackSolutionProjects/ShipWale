import { TextField } from '@mui/material'
import React from 'react'

const TextInput = ({
    formData,
    handleChange,
    name,
    label
}) => {
  return (
    <TextField
        label={label}
        name={name}
        size="small"
        value={formData[name]}
        onChange={handleChange}
        sx={{ minWidth: 200 }}
    />
  )
}

export default TextInput
