import { Button } from "@mui/material"
const CustomButton = ({secondary,sx, disabled, title, onClick, color, Component}) => {
  return (
    <Button variant={secondary?'outlined':'contained'} color={color} sx={sx} disabled={disabled} onClick={onClick}>
      {title?title:null} {Component? Component : null}
    </Button>
  )
}

export default CustomButton
