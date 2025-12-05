import { useEffect , useMemo, useState  } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import UserDiscountModal from './Modals/UserDiscountModal'
import MerchantInvoiceModal from './Modals/MerchantInvoiceModal'
import formatDateAndTime from '../helpers/formatDateAndTime'
import getVerifiedMerchantsService from '../services/merchantServices/getVerifiedMerchantsService'
import allowNegativeBalanceService from '../services/merchantServices/allowNegativeBalanceService'
import revokeNegativeBalanceService from '../services/merchantServices/revokeNegativeBalanceService'
import { toast } from 'react-toastify'
const API_URL = import.meta.env.VITE_APP_API_URL
const View = ({merchant, balance ,fullName, email, phone,isActive, uid  , gst, setView, businessName, cin, aadhar_number, pan_number, address, city, state, pin, accountNumber, ifsc, bank}) => {
    const [isActivated, setIsActivated] = useState(isActive)
    const activate = () => {
        fetch(`${API_URL}/merchant/activate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({uid})
        }).then(response => response.json()).then(result => alert(result.message)).then(()=>setIsActivated(true));
    }
    const deactivate = () => {
        fetch(`${API_URL}/merchant/deactivate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({uid})
        }).then(response => response.json()).then(result => alert(result.message)).then(()=>setIsActivated(false));
    }
    const [profilePhoto, setProfilePhoto] = useState(null)
    useEffect(()=>{
        const getProfilePhoto = async () => {
            await fetch(`${API_URL}/s3/getUrl`, {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                    'Accept' : 'application/json',
                    'Authorization' : localStorage.getItem('token')
                },
                body : JSON.stringify({key : merchant['selfie_doc']})
            }).then((response)=>response.json()).then(result => setProfilePhoto(result.downloadURL))
        }
        getProfilePhoto()
    })
    const handleDownload = async (name) => {
        await fetch(`${API_URL}/s3/getUrl`, {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json',
            'Accept' : 'application/json',
            'Authorization' : localStorage.getItem('token')
        },
        body : JSON.stringify({key : merchant[name]})
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
            <div className='absolute inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex justify-center items-center overflow-y-auto'>
                <div className='relative p-8 max-w-[500px] bg-white rounded-2xl overflow-hidden space-y-8'>
                <p className='absolute top-5 right-6 cursor-pointer' onClick={()=>{setView(false)}}>X</p>
                    <p className='text-2xl font-medium text-center'>Merchant Details</p>
                    <div className='w-full space-y-6'>
                        <div className='w-full flex items-center justify-center space-x-8'>
                            <div className='flex justify-center items-center w-32 h-32'>
                                <img src={`${profilePhoto?profilePhoto:"/user.webp"}`}/>
                            </div>
                            <div className=''>
                                <p className='font-medium text-xl'>{businessName}</p>
                                <p className='font-medium text-sm text-gray-600'>({fullName})</p>
                                <p className='font-medium text-sm text-gray-600'>{email}</p>
                                <p className='font-medium text-sm text-gray-600'>{phone}</p>
                                <p className='font-medium text-sm text-green-400'>Balance : {balance}</p>
                            </div>
                        </div>
                        <div className='w-full font-medium text-gray-700'>
                            <p>GSTIN : {gst} <span className="cursor-pointer" onClick={()=>handleDownload('gst_doc')}>[PDF]</span></p>
                            <p>CIN : {cin}</p>
                            <p>Aadhar Number : {aadhar_number} <span className="cursor-pointer" onClick={()=>handleDownload('aadhar_doc')}>[PDF]</span></p>
                            <p>PAN Number : {pan_number} <span className="cursor-pointer" onClick={()=>handleDownload('pan_doc')}>[PDF]</span></p>
                            <p>Address : {address}</p>
                            <p>City : {city}</p>
                            <p>State : {state}</p>
                            <p>Pincode : {pin}</p>
                            <p>Bank Name : {bank}</p>
                            <p>A/C No. : {accountNumber}</p>
                            <p>IFSC : {ifsc}</p>
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
            <UserDiscountModal open={openDiscountModal} onClose={closeDiscountModal} uid={uid} />
        </>
    )
}


const MerchantManage =  () => {
    // Data state
    const [rows, setRows] = useState([])
    const [rowCount, setRowCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0) // 0-based for DataGrid; backend expects 1-based
    const pageSize = 20 // backend is fixed to 20

    // Filters
    const [filters, setFilters] = useState({
        merchant_name: '',
        business_name: '',
        merchant_email: '',
        merchant_phone: '',
        is_to_pay_merchant: '',
    })

    // View modal state
    const [selectedMerchant, setSelectedMerchant] = useState(null)
    const [showView, setShowView] = useState(false)
    const [showInvoice, setShowInvoice] = useState(false)

    // To Pay (Negative Limit) modal state
    const [showToPay, setShowToPay] = useState(false)
    const [selectedToPay, setSelectedToPay] = useState(null)
    const [toPayForm, setToPayForm] = useState({ negative_limit: '' })
    const [toPaySubmitting, setToPaySubmitting] = useState(false)

    // Columns definition
    const columns = useMemo(() => [
        { field: 'uid', headerName: 'User ID', width: 100 },
        { field: 'fullName', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'businessName', headerName: 'Business', flex: 1, minWidth: 160 },
        { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200 },
        { field: 'phone', headerName: 'Phone', width: 140 },
        { field: 'balance', headerName: 'Balance', width: 120, renderCell: (p)=> p.value !== undefined && p.value !== null ? `₹${p.value}` : '₹0' },
        { field: 'createdAt', headerName: 'Joined', width: 170, renderCell: (p)=> p.value ? formatDateAndTime(p.value) : '' },
        { field: 'isActive', headerName: 'Status', width: 110, renderCell: (params)=> (
            <span className={`px-2 py-1 rounded-2xl text-xs ${params.value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {params.value ? 'Active' : 'Inactive'}
            </span>
        ) },
        { field: 'actions', headerName: 'Actions', width: 320, sortable: false, filterable: false, renderCell: (params)=> (
            <div className="flex items-center space-x-2">
                <button
                    className="px-3 py-1 bg-red-500 text-white rounded-2xl text-sm"
                    onClick={() => { setSelectedMerchant(params.row); setShowView(true); }}
                >
                    View
                </button>
                <button
                    className="px-3 py-1 bg-purple-600 text-white rounded-2xl text-sm"
                    onClick={() => {
                        setSelectedToPay(params.row);
                        const defaultLimit = (params.row?.negative_value ?? params.row?.negative_limit);
                        setToPayForm({ negative_limit: (defaultLimit ?? '') === null ? '' : String(defaultLimit ?? '') });
                        setShowToPay(true);
                    }}
                >
                    To Pay
                </button>
                <button
                    className="px-3 py-1 bg-green-600 text-white rounded-2xl text-sm"
                    onClick={() => { setSelectedMerchant(params.row); setShowInvoice(true); }}
                >
                    Invoice
                </button>
            </div>
        ) }
    ], [])

    // Debounced fetch
    useEffect(() => {
        let active = true
        const handler = setTimeout(async () => {
            setLoading(true)
            try {
                const res = await getVerifiedMerchantsService({
                    page: page + 1,
                    ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined && v !== null))
                })
                if (!active) return
                const payload = res?.data
                setRows(payload?.data || [])
                setRowCount(payload?.totalCount || 0)
            } catch (e) {
                console.error(e)
                setRows([])
                setRowCount(0)
            } finally {
                if (active) setLoading(false)
            }
        }, 400) // debounce

        return () => { active = false; clearTimeout(handler) }
    }, [page, filters])

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
            {showView && selectedMerchant && (
                <View {...selectedMerchant} merchant={selectedMerchant} setView={setShowView} />
            )}
            {showToPay && selectedToPay && (
                <div className='absolute inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex justify-center items-center overflow-y-auto'>
                    <div className='relative p-6 w-full max-w-[460px] bg-white rounded-2xl overflow-hidden space-y-4'>
                        <p className='absolute top-4 right-5 cursor-pointer' onClick={() => { if (!toPaySubmitting) setShowToPay(false) }}>X</p>
                        <p className='text-xl font-medium text-center'>To Pay</p>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Negative Limit (≤ 0)</label>
                            <input
                                type='number'
                                max={0}
                                step='0.01'
                                className='border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-red-400'
                                placeholder='Enter negative limit (e.g., -5000)'
                                value={toPayForm.negative_limit}
                                onChange={(e) => setToPayForm({ negative_limit: e.target.value })}
                                disabled={toPaySubmitting}
                            />
                            <p className='text-xs text-gray-500'>Set a negative spending limit for this merchant. Must be less than or equal to 0.</p>
                        </div>
                        <div className='flex items-center justify-between pt-2'>
                            {(selectedToPay?.negative_limit !== undefined && selectedToPay?.negative_limit !== null) || (selectedToPay?.negative_value !== undefined && selectedToPay?.negative_value !== null) ? (
                                <button
                                    className={`px-3 py-2 rounded-2xl text-sm ${toPaySubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white'}`}
                                    onClick={async () => {
                                        if (toPaySubmitting) return;
                                        try {
                                            setToPaySubmitting(true)
                                            await revokeNegativeBalanceService(selectedToPay.uid)
                                            toast.success('Negative limit removed')
                                            // Update local rows
                                            setRows(prev => prev.map(r => r.uid === selectedToPay.uid ? { ...r, negative_limit: null, negative_value: null } : r))
                                            setShowToPay(false)
                                        } catch (err) {
                                            const msg = err instanceof Error ? err.message : 'Failed to remove negative limit'
                                            toast.error(msg)
                                        } finally {
                                            setToPaySubmitting(false)
                                        }
                                    }}
                                    disabled={toPaySubmitting}
                                >
                                    Remove Negative Limit
                                </button>
                            ) : <div />}
                            <div className='flex items-center space-x-2'>
                                <button
                                    className={`px-3 py-2 rounded-2xl text-sm border ${toPaySubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    onClick={() => setShowToPay(false)}
                                    disabled={toPaySubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={`px-3 py-2 rounded-2xl text-sm ${toPaySubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white'}`}
                                    onClick={async () => {
                                        if (toPaySubmitting) return;
                                        const val = parseFloat(toPayForm.negative_limit)
                                        if (isNaN(val)) { toast.error('Please enter a number'); return }
                                        if (val > 0) { toast.error('Negative Limit must be less than or equal to 0'); return }
                                        try {
                                            setToPaySubmitting(true)
                                            await allowNegativeBalanceService(selectedToPay.uid, { negative_limit: val })
                                            toast.success('Negative limit updated successfully')
                                            // Update local rows
                                            setRows(prev => prev.map(r => r.uid === selectedToPay.uid ? { ...r, negative_limit: val, negative_value: val } : r))
                                            setShowToPay(false)
                                        } catch (err) {
                                            const msg = err instanceof Error ? err.message : 'Failed to update negative limit'
                                            toast.error(msg)
                                        } finally {
                                            setToPaySubmitting(false)
                                        }
                                    }}
                                    disabled={toPaySubmitting}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showInvoice && selectedMerchant && (
                <MerchantInvoiceModal
                    open={showInvoice}
                    onClose={() => setShowInvoice(false)}
                    merchantId={selectedMerchant?.uid}
                />
            )}
            <div className="py-16 w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
                <div className='w-full max-w-[1200px] px-6 flex flex-col items-stretch space-y-6'>
                    <div className='text-center text-3xl font-medium text-black'>Verified Merchants</div>

                    {/* Filters */}
                    <div className="w-full bg-white p-4 rounded-xl shadow-sm border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Merchant Name"
                                value={filters.merchant_name}
                                onChange={handleFilterChange('merchant_name')}
                            />
                            <input
                                type="text"
                                className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Business Name"
                                value={filters.business_name}
                                onChange={handleFilterChange('business_name')}
                            />
                            <input
                                type="email"
                                className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Merchant Email"
                                value={filters.merchant_email}
                                onChange={handleFilterChange('merchant_email')}
                            />
                            <input
                                type="text"
                                className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Merchant Phone"
                                value={filters.merchant_phone}
                                onChange={handleFilterChange('merchant_phone')}
                            />
                            <select
                                className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-red-400"
                                value={filters.is_to_pay_merchant}
                                onChange={handleFilterChange('is_to_pay_merchant')}
                            >
                                <option value=''>All Merchants</option>
                                <option value='true'>To Pay Merchants</option>
                                <option value='false'>Non To Pay Merchants</option>
                            </select>
                        </div>
                    </div>

                    {/* DataGrid */}
                    <div className='w-full bg-white rounded-xl shadow-sm border overflow-hidden'>
                        <div className='p-3' style={{ height: 540 }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            getRowId={(row) => row.uid}
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
                        />
                        </div>
                        <PaginationBar />
                    </div>
                </div>
            </div>
        </>
    )
}

export default MerchantManage
