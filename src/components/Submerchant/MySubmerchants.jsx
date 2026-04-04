import { useEffect , useMemo, useState  } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import UserDiscountModal from '../Modals/UserDiscountModal'
import AddSubmerchantModal from '../Modals/AddSubmerchantModal'
import UpdateSubmerchantMarginModal from '../Modals/UpdateSubmerchantMarginModal'
import getMySubmerchantService from '@/services/merchantServices/getMySubmerchantService'
import getMySubmerchantsService from '@/services/merchantServices/getMySubmerchantsService'
const API_URL = import.meta.env.VITE_APP_API_URL
const View = ({ userRoleId, onClose }) => {
    const [user, setUser] = useState({})
    const getUserDetails = async () => {
        const res = await getMySubmerchantService({submerchant_id : userRoleId})
        setUser(res?.data)
    }
    useEffect(()=>{
        getUserDetails()
    }, [userRoleId])
    const [isActivated, setIsActivated] = useState(Boolean(user?.user_role_active))
    useEffect(() => {
        setIsActivated(Boolean(user?.user_role_active))
    }, [user?.user_role_active])
    const activate = () => {
        fetch(`${API_URL}/roles/activate/${user?.user_role_id}`, {
            method: 'PATCH',
            headers: {

                'Accept': 'application/json',
                'Authorization': localStorage.getItem('token')
            }
        }).then(response => response.json()).then(result => alert(result.message)).then(()=>setIsActivated(true));
    }
    const deactivate = () => {
        fetch(`${API_URL}/roles/deactivate/${user?.user_role_id}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Authorization': localStorage.getItem('token')
            }
        }).then(response => response.json()).then(result => alert(result.message)).then(()=>setIsActivated(false));
    }
    const [profilePhoto, setProfilePhoto] = useState(null)
    useEffect(() => {
        const getProfilePhoto = async () => {
            if (!user?.selfie_doc) {
                setProfilePhoto(null)
                return
            }
            await fetch(`${API_URL}/s3/getUrl`, {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                    'Accept' : 'application/json',
                    'Authorization' : localStorage.getItem('token')
                },
                body : JSON.stringify({key : user['selfie_doc']})
            }).then((response)=>response.json()).then(result => setProfilePhoto(result.downloadURL))
        }
        getProfilePhoto()
    }, [user?.selfie_doc])
    const handleDownload = async (name) => {
        await fetch(`${API_URL}/s3/getUrl`, {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json',
            'Accept' : 'application/json',
            'Authorization' : localStorage.getItem('token')
        },
        body : JSON.stringify({key : user[name]})
    }).then(response => response.json()).then(async result => {
        const link = document.createElement('a');
        link.href = result.downloadURL;
        link.target = '_blank'
        link.style.display = 'none'; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
    }
    const [openDiscountModal, setOpenDiscountModal] = useState(false);
    const closeDiscountModal = () => {
        setOpenDiscountModal(false);
    }
    return (
        <>
            <div className='fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex justify-center items-center overflow-y-auto'>
                <div className='relative p-8 max-w-[500px] bg-white rounded-2xl overflow-hidden space-y-8'>
                <p className='absolute top-5 right-6 cursor-pointer' onClick={onClose}>X</p>
                    <p className='text-2xl font-medium text-center'>Merchant Details</p>
                    <div className='w-full space-y-6'>
                        <div className='w-full flex items-center justify-center space-x-8'>
                            <div className='flex justify-center items-center w-32 h-32'>
                                <img src={`${profilePhoto?profilePhoto:"/user.webp"}`}/>
                            </div>
                            <div className=''>
                                <p className='font-medium text-xl'>{user.business_name || user.fullName}</p>
                                {!user.business_name && <p className='font-medium text-sm text-gray-600'>(user.fullName)</p>}
                                <p className='font-medium text-sm text-gray-600'>{user.email}</p>
                                <p className='font-medium text-sm text-gray-600'>{user.phone}</p>
                                <p className='font-medium text-sm text-green-400'>Balance : {user.balance}</p>
                            </div>
                        </div>
                        <div className='w-full font-medium text-gray-700'>
                            <p>GSTIN : {user.gstin} <span className="cursor-pointer" onClick={()=>handleDownload('gst_doc')}>[PDF]</span></p>
                            <p>CIN : {user.cin}</p>
                            <p>Aadhar Number : {user.aadhar_number} <span className="cursor-pointer" onClick={()=>handleDownload('aadhar_doc')}>[PDF]</span></p>
                            <p>PAN Number : {user.pan_number} <span className="cursor-pointer" onClick={()=>handleDownload('pan_doc')}>[PDF]</span></p>
                            <p>Address : {user.address}</p>
                            <p>City : {user.city}</p>
                            <p>State : {user.state}</p>
                            <p>Pincode : {user.pincode}</p>
                            <p>Bank Name : {user.bank_name}</p>
                            <p>A/C No. : {user.account_number}</p>
                            <p>IFSC : {user.ifsc}</p>
                            <p>Cancelled Cheque : <span className="cursor-pointer" onClick={()=>handleDownload('cancelledCheque')}>[PDF]</span></p>
                        </div>
                    </div>
                    <div className='flex space-x-1'>
                        <button onClick={isActivated?()=>deactivate():()=>activate()}  className={` ${isActivated?"bg-red-500":"bg-green-500"} text-white mx-2  py-2 px-4 rounded`}>
                            {isActivated? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => setOpenDiscountModal(true)}  className={`bg-red-500 text-white mx-2  py-2 px-4 rounded`}>
                            Discounts
                        </button>
                    </div>
                </div>
            </div>
            <UserDiscountModal open={openDiscountModal} onClose={closeDiscountModal} uid={user?.uid} />
        </>
    )
}


const MySubmerchants =  () => {
    // Data state
    const [rows, setRows] = useState([])
    const [rowCount, setRowCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0) // 0-based for DataGrid; backend expects 1-based
    const pageSize = 20 // backend is fixed to 20

    // Filters
    const [filters, setFilters] = useState({
        submerchant_name: '',
        submerchant_email: '',
        submerchant_phone: '',
        status: '',
    })

    // Add submerchant modal + refetch trigger
    const [openAddSubmerchantModal, setOpenAddSubmerchantModal] = useState(false)
    const [refreshIndex, setRefreshIndex] = useState(0)

    // Update margin modal
    const [openUpdateMarginModal, setOpenUpdateMarginModal] = useState(false)
    const [selectedSubmerchantId, setSelectedSubmerchantId] = useState(null)
    const [selectedCurrentMargin, setSelectedCurrentMargin] = useState(null)

    // View modal state
    const [showView, setShowView] = useState(false)
    const [viewUserRoleId, setViewUserRoleId] = useState(null)

    // Columns definition
    const columns = useMemo(() => [
        { field: 'user_role_id', headerName: 'Account ID', width: 100 },
        { field: 'SUBMERCHANT_NAME', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'SUBMERCHANT_EMAIL', headerName: 'Email', flex: 1.2, minWidth: 200 },
        { field: 'SUBMERCHANT_PHONE', headerName: 'Phone', width: 140 },
        { field: 'MARGIN', headerName: 'Margin %', width: 110 },
        { field: 'STATUS', headerName: 'Status', width: 110 },
        { field: 'actions', headerName: 'Actions', width: 320, sortable: false, filterable: false, renderCell: (params)=> {
            return (
            <>
                {
                    ['ACTIVE', 'INACTIVE'].includes(params.row.STATUS) ? (
                        <div className="flex items-center space-x-2">
                            <button
                                className="px-3 py-1 bg-red-500 text-white rounded-2xl text-sm"
                                onClick={() => {
                                    setViewUserRoleId(params.row.user_role_id)
                                    setShowView(true)
                                }}
                            >
                                View
                            </button>

                            {params.row.STATUS === 'ACTIVE' ? (
                                <button
                                    className="px-3 py-1 bg-red-500 text-white rounded-2xl text-sm"
                                    onClick={() => {
                                        setSelectedSubmerchantId(params.row.user_role_id)
                                        setSelectedCurrentMargin(params.row.MARGIN)
                                        setOpenUpdateMarginModal(true)
                                    }}
                                >
                                    Update Margin
                                </button>
                            ) : null}
                        </div>
                    ) : null
                }
            </>
        )} }
    ], [])

    // Debounced fetch
    useEffect(() => {
        let active = true
        const handler = setTimeout(async () => {
            setLoading(true)
            try {
                const res = await getMySubmerchantsService({
                    page: page + 1, // backend is 1-based
                    ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined && v !== null))
                });
                if (!active) return
                const rows = res?.data || []
                const pagination = res?.pagination || {}
                setRows(rows)
                setRowCount(pagination?.totalCount || 0)
            } catch (e) {
                console.error(e)
                setRows([])
                setRowCount(0)
            } finally {
                if (active) setLoading(false)
            }
        }, 400) // debounce

        return () => { active = false; clearTimeout(handler) }
    }, [page, filters, refreshIndex])

    const handleFilterChange = (key) => (e) => {
        const value = e.target.value
        setFilters((prev) => ({ ...prev, [key]: value }))
        setPage(0) // reset to first page on filter change
    }

    // Custom pagination bar (consistent with app buttons/look)
    const totalPages = Math.max(1, Math.ceil((rowCount || 0) / pageSize))
    const start = rowCount ? (page * pageSize) + 1 : 0
    const end = rowCount ? Math.min((page + 1) * pageSize, rowCount) : 0

    const PaginationBar = () => (
        <div className="w-full h-16 bg-white relative items-center px-4 flex border-t rounded-b-xl">
            <div className="text-sm text-gray-600">
                {loading ? 'Loading…' : `Showing ${start}-${end} of ${rowCount}`}
            </div>
            <div className="ml-auto flex items-center space-x-2">
                <button
                    className={`px-3 py-1 bg-red-500 rounded text-white ${page <= 0 || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => { if (page > 0 && !loading) setPage(page - 1) }}
                    disabled={page <= 0 || loading}
                >
                    Prev
                </button>
                <div className="text-sm text-gray-700">
                    Page {page + 1} of {totalPages}
                </div>
                <button
                    className={`px-3 py-1 bg-red-500 rounded text-white ${(page + 1) >= totalPages || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => { if ((page + 1) < totalPages && !loading) setPage(page + 1) }}
                    disabled={(page + 1) >= totalPages || loading}
                >
                    Next
                </button>
            </div>
        </div>
    )

    return (
        <>
            <AddSubmerchantModal
                open={openAddSubmerchantModal}
                onClose={() => setOpenAddSubmerchantModal(false)}
                onSuccess={() => setRefreshIndex((v) => v + 1)}
            />
            <UpdateSubmerchantMarginModal
                open={openUpdateMarginModal}
                onClose={() => {
                    setOpenUpdateMarginModal(false)
                    setSelectedSubmerchantId(null)
                    setSelectedCurrentMargin(null)
                }}
                submerchantId={selectedSubmerchantId}
                currentMargin={selectedCurrentMargin}
                onSuccess={() => setRefreshIndex((v) => v + 1)}
            />
            {showView && viewUserRoleId && (
                <View
                    userRoleId={viewUserRoleId}
                    onClose={() => {
                        setShowView(false)
                        setViewUserRoleId(null)
                    }}
                />
            )}
            <div className="py-16 w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
                <div className='w-full max-w-[1200px] px-6 flex flex-col items-stretch space-y-6'>
                    <div className='w-full flex items-center justify-between'>
                        <div className='text-3xl font-medium text-black'>My Submerchants</div>
                        <button
                            className='px-4 py-2 bg-red-500 text-white rounded'
                            onClick={() => setOpenAddSubmerchantModal(true)}
                        >
                            Add Submerchant
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="w-full bg-white p-4 rounded-xl shadow-sm border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="User Name"
                                value={filters.submerchant_name}
                                onChange={handleFilterChange('submerchant_name')}
                            />
                            <input
                                type="email"
                                className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="User Email"
                                value={filters.submerchant_email}
                                onChange={handleFilterChange('submerchant_email')}
                            />
                            <input
                                type="text"
                                className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="User Phone"
                                value={filters.submerchant_phone}
                                onChange={handleFilterChange('submerchant_phone')}
                            />
                            <select
                                className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-red-400"
                                value={filters.status}
                                onChange={handleFilterChange('status')}
                            >
                                <option value=''>All</option>
                                <option value='REQUESTED'>Requested</option>
                                <option value='ACTIVE'>Active</option>
                                <option value='INACTIVE'>Rejected</option>
                                <option value='CANCELLED'>Cancelled</option>
                                <option value='REJECTED'>Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* DataGrid */}
                    <div className='w-full bg-white rounded-xl shadow-sm border overflow-hidden'>
                        <div className='p-3' style={{ height: 540 }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            getRowId={(row) => row.user_role_id}
                            loading={loading}
                            rowCount={rowCount}
                            pageSizeOptions={[pageSize]}
                            paginationMode="server"
                            paginationModel={{ page, pageSize }}
                            onPaginationModelChange={(model) => {
                                if (model.page !== page) setPage(model.page)
                            }}
                            disableRowSelectionOnClick
                            density="compact"
                            disableColumnMenu
                            hideFooter
                            rowHeight={64}
                            columnHeaderHeight={64}
                            sx={{
                                border: '1px solid #000',
                                borderRadius: 0,
                                '& .MuiDataGrid-columnHeaders': {
                                  borderBottom: '1px solid #000',
                                  backgroundColor: '#A34757',
                                color: '#FFF',
                                },
                                '& .MuiDataGrid-columnHeader': {
                                  backgroundColor: '#A34757',
                                  fontWeight: 'bold',
                                  },
                                '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
                                  borderRight: '1px solid #000',
                                },
                                '& .MuiDataGrid-columnHeader:first-of-type, & .MuiDataGrid-cell:first-of-type': {
                                  borderLeft: '1px solid #000',
                                },
                                '& .MuiDataGrid-row': {
                                  borderBottom: '1px solid #000',
                                },
                            }}
                        />
                        </div>
                        <PaginationBar />
                    </div>
                </div>
            </div>
        </>
    )
}

export default MySubmerchants
