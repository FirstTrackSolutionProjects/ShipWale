
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaChevronUp, FaChevronDown } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { USER_ROLES } from '@/Constants'
const SidebarItem = ({ item, setShowRecharge, toggleSidebar = () => {}, sidebarExpanded = true }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const {role} = useAuth()
    const admin = role === USER_ROLES.ADMIN;
    const [isOpen, setIsOpen] = useState(false)
    const [isCurrentMenu, setIsCurrentMenu] = useState(location.pathname === `/dashboard/${item.url}`)
    useEffect(() => {
        setIsCurrentMenu(location.pathname === `/dashboard/${item.url}`)
    }, [navigate])

    // Close dropdown whenever sidebar collapses (icon-only mode)
    useEffect(() => {
        if (!sidebarExpanded && isOpen) {
            setIsOpen(false)
        }
    }, [sidebarExpanded, isOpen])
    return (
        <>
            <div
                onClick={item.isDropdown ? () => setIsOpen(!isOpen) : (item.name === "Wallet Recharge" ? () => setShowRecharge(true) : () => { navigate(`/dashboard/${item.url}`); toggleSidebar(); })}
                className={`cursor-pointer px-2 w-full h-12 ${isCurrentMenu ? 'bg-red-500' : 'bg-black'} text-white focus:outline-none transition-all duration-300 hover:bg-red-400 relative flex items-center ${sidebarExpanded ? 'justify-start' : 'justify-center'}`}
            >
                {item.icon !== "/image/logo-nobg.png" && <item.icon className={`${sidebarExpanded ? 'mr-3' : ''}`} />}
                {sidebarExpanded && <p className=''>{item.name}</p>}
                {sidebarExpanded && item.isDropdown ? (
                    <p className={`absolute transition-transform duration-300 ${isOpen ? "rotate-90" : ""} right-1`}>
                        &#9656;
                    </p>
                ) : null}
            </div>
            {item.isDropdown ? <div className={`${isOpen && sidebarExpanded ? `` : "hidden"}`}>
                {item.dropDownOptions.map((subitem, index) => {
                    if ((subitem.admin && !admin) || (subitem.merchantOnly && admin)) return;
                    return <SidebarItem item={subitem} setShowRecharge={setShowRecharge} toggleSidebar={toggleSidebar} sidebarExpanded={sidebarExpanded} />
                })}
            </div> : null}
        </>
    )
}

export default SidebarItem