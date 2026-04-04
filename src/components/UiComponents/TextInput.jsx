import { TextField } from '@mui/material'
import React from 'react'

const TextInput = ({
    formData,
    handleChange,
    name,
    label,
    config
}) => {
  return (
    <TextField
        label={label}
        name={name}
        size="small"
        value={formData[name]}
        onChange={handleChange}
        sx={{ minWidth: 200 }}
        inputProps={config}
    />
  )
}

export default TextInput
