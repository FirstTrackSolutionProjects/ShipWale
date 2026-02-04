
import PersonIconMUI from '@mui/icons-material/Person';
const PersonIcon = ({onClick=()=>{}}) => {
  return (
    <PersonIconMUI className='cursor-pointer' onClick={onClick} />
  )
}

export default PersonIcon
