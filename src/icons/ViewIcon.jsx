import VisibilityIcon from '@mui/icons-material/Visibility';
const ViewIcon = ({onClick=()=>{}, color="blue-500"}) => {
  return (
    <VisibilityIcon fontSize="small" className={`cursor-pointer text-${color}`} onClick={onClick} />
  )
}

export default ViewIcon
