import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React from 'react'

const SelectInput = ({
    options,
    formData,
    handleChange,
    name,
    label,
    haveAllOption = true
}) => {
  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
		<InputLabel id={`${name}-select-label`} className="bg-white w-full">{label}</InputLabel>
		<Select
			labelId={`${name}-select-label`}
			value={formData[name]}
			onChange={handleChange}
			name={name}
			label={label}
			sx={{ backgroundColor: 'white', borderRadius: 1 }}
		>
			{haveAllOption && (
				<MenuItem value="ALL">
					All
				</MenuItem>
			)}
			{options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
		</Select>
	</FormControl>
  )
}

export default SelectInput


