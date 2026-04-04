import useAuth from "@/hooks/useAuth"

const AccessWrapper = ({ roles, children }) => {
    const { role } = useAuth();
  return (
    roles.includes(role) ? children : null
  )
}

export default AccessWrapper
