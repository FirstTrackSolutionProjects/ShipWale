import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_APP_API_URL

const openUrl = (url) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const View = ({ request, setView, onAction }) => {
    const handleApprove = async () => {
        try {
            const response = await fetch(`${API_URL}/verification/${request.VERIFICATION_ID}/accept`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': localStorage.getItem('token'),
                },
            });
            const result = await response.json();
            alert(result.message || 'Verification request accepted successfully');
            onAction?.();
        } catch (e) {
            console.error(e);
            alert('Failed to accept verification request');
        }
    }

    const handleReject = async () => {
        try {
            const response = await fetch(`${API_URL}/verification/${request.VERIFICATION_ID}/reject`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': localStorage.getItem('token'),
                },
            });
            const result = await response.json();
            alert(result.message || 'Verification request rejected successfully');
            onAction?.();
        } catch (e) {
            console.error(e);
            alert('Failed to reject verification request');
        }
    }

    const handleDownload = (fieldName) => {
        openUrl(request?.[fieldName]);
    }
    return (
        <>
            <div className='absolute inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex justify-center items-center overflow-y-auto'>
                <div className='relative p-6 max-w-[400px] bg-white rounded-2xl overflow-hidden space-y-8'>
                <p className='absolute top-5 right-6 cursor-pointer' onClick={()=>{setView(false)}}>X</p>
                    <p className='text-2xl font-medium text-center'>User Details</p>
                    <div className='w-full space-y-6'>
                        <div className='w-full flex items-center justify-center space-x-8'>
                            <div className='flex justify-center items-center w-32 h-32'>
                                <img src={request?.SELFIE_DOC || "user.webp"} />
                            </div>
                            <div className=''>
                                <p className='font-medium text-xl'>{request?.BUSINESS_NAME || request?.USER_NAME}</p>
                                {!request.BUSINESS_NAME && <p className='font-medium text-sm text-gray-600'>({request?.USER_NAME})</p>}
                                <p className='font-medium text-sm text-gray-600'>{request?.USER_EMAIL}</p>
                                <p className='font-medium text-sm text-gray-600'>{request?.USER_PHONE}</p>
                                <p className='font-medium text-sm text-green-400'>Balance(Coming Soon)</p>
                            </div>
                        </div>
                        <div className='w-full font-medium text-gray-700'>
                            <p>
                                GSTIN : {request?.GST || '-'}{' '}
                                {request?.GST_DOC ? <span className='cursor-pointer' onClick={() => handleDownload('GST_DOC')}>[PDF]</span> : null}
                            </p>
                            <p>CIN : {request?.CIN || '-'}</p>
                            <p>
                                Aadhar Number : {request?.AADHAR_NUMBER || '-'}{' '}
                                {request?.AADHAR_DOC ? <span className='cursor-pointer' onClick={() => handleDownload('AADHAR_DOC')}>[PDF]</span> : null}
                            </p>
                            <p>
                                PAN Number : {request?.PAN_NUMBER || '-'}{' '}
                                {request?.PAN_DOC ? <span className='cursor-pointer' onClick={() => handleDownload('PAN_DOC')}>[PDF]</span> : null}
                            </p>
                            <p>Address : {request?.ADDRESS || '-'}</p>
                            <p>City : {request?.CITY || '-'}</p>
                            <p>State : {request?.STATE || '-'}</p>
                            <p>Pincode : {request?.PIN || '-'}</p>
                            <p>Bank Name : {request?.BANK || '-'}</p>
                            <p>A/C No. : {request?.ACCOUNT_NUMBER || '-'}</p>
                            <p>IFSC : {request?.IFSC || '-'}</p>
                            <p>
                                Cancelled Cheque :{' '}
                                {request?.CANCELLED_CHEQUE ? <span className='cursor-pointer' onClick={() => handleDownload('CANCELLED_CHEQUE')}>[PDF]</span> : '-'}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleApprove} className=" bg-red-500 text-white mx-2  py-2 px-4 rounded">
                        Approve
                    </button>
                    <button onClick={handleReject} className=" bg-red-500 text-white mx-2  py-2 px-6 rounded">
                        Reject
                    </button>
                </div>
            </div>
        </>
    )
}


const Card = ({ request, onAction }) => {
    const [view, setView] = useState(false)
    return (
        <>
            {view && <View request={request} setView={setView} onAction={() => { setView(false); onAction?.(); }} />}
            <div className='p-4 border cursor-pointer ' onClick={()=>setView(true)} >
                <p>Request Id : {request?.VERIFICATION_ID}</p>
                <p>User Id : {request?.USER_ID}</p>
                <p>Name : {request?.USER_NAME}</p>
                {request?.BUSINESS_NAME && <p>Business Name : {request?.BUSINESS_NAME}</p>}
            </div>
        </>
    )
}

const VerificationRequests =  () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(false)

    const getVerificationRequests = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/verification`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': localStorage.getItem('token'),
                }
            })
            const data = await response.json();
            setRequests(Array.isArray(data?.data) ? data.data : [])
        } catch (e) {
            console.error(e)
            setRequests([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getVerificationRequests();
    },[]);
  return (
    <>
    <div className=" py-16 w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
      <div className='w-full p-8 flex flex-col items-center space-y-8'>
      <div className='text-center text-3xl font-medium text-black'>User Verification Requests</div>
      <div className='w-full bg-white p-8'>
        {
            loading ? (
                <div className='w-full text-center text-gray-600'>Loading...</div>
            ) : requests.length === 0 ? (
                <div className='w-full text-center text-gray-600'>No pending verification requests</div>
            ) :
            requests.map(((request,index)=>(
                <Card key={index} request={request} onAction={getVerificationRequests} />
            )))
        }
      </div>
      </div>
    </div>
    </>
  )
}

export default VerificationRequests
