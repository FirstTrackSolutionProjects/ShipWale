import React from "react";
import { Autocomplete, TextField, Checkbox } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const MultiSelect = ({ options, selectedValues, setSelectedValues, disabled, label, ref }) => {
  const processedSelectedValues = Array.isArray(selectedValues) ? 
    (selectedValues[0] && typeof selectedValues[0] === 'object' ? selectedValues.map(v => v.id) : selectedValues) 
    : [];

  return (
    <Autocomplete
      multiple
      ref={ref}
      options={options}
      disabled={disabled}
      size="small"
      sx={{
        mt:3
      }}
      disableCloseOnSelect
      getOptionLabel={(option) => option.name}
      value={options.filter(option => processedSelectedValues.some(value => String(value) === String(option.id)))}
      onChange={(event, newValue) => setSelectedValues(newValue.map(option => option.id))}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            size="small"
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            checked={selected}
          />
          {option.name}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={label} />} 
    />
  );
};

export default MultiSelect;
