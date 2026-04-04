import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import { USER_ROLES } from '@/Constants'
import { useAuth } from '@/context/AuthContext'

import getSubmerchantRequestsService from '@/services/submerchantServices/getSubmerchantRequestsService'
import acceptSubmerchantRequestService from '@/services/submerchantServices/acceptSubmerchantRequestService'
import rejectSubmerchantRequestService from '@/services/submerchantServices/rejectSubmerchantRequestService'

const RequestCard = ({ request, acceptDisabled, onAccept, onReject, actionLoading }) => {
	const requestId = request?.id
	return (
		<div className='w-full p-4 border rounded-lg bg-white flex flex-col space-y-2'>
			<div className='text-sm text-gray-600'>Request ID: {requestId}</div>
			<div className='text-lg font-medium text-gray-900'>{request?.merchant_name || 'Merchant'}</div>
			<div className='text-sm text-gray-700'>{request?.merchant_email}</div>
			<div className='text-sm text-gray-700'>{request?.merchant_phone}</div>
			<div className='pt-2 flex items-center space-x-2'>
				<button
					className={`px-4 py-2 rounded text-white ${acceptDisabled || actionLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'}`}
					disabled={acceptDisabled || actionLoading}
					onClick={() => onAccept?.(requestId)}
				>
					Accept
				</button>
				<button
					className={`px-4 py-2 rounded text-white ${actionLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'}`}
					disabled={actionLoading}
					onClick={() => onReject?.(requestId)}
				>
					Reject
				</button>
			</div>
		</div>
	)
}

const SubmerchantRequests = () => {
	const { role, verified, isAuthenticated } = useAuth()
	const [requests, setRequests] = useState([])
	const [loading, setLoading] = useState(false)
	const [actionLoading, setActionLoading] = useState(false)

	const acceptDisabled = useMemo(() => {
		if (!isAuthenticated) return true
		if (!verified) return true
		return false
	}, [isAuthenticated, role, verified])

	const loadRequests = async (options = {}) => {
		setLoading(true)
		try {
			const res = await getSubmerchantRequestsService(options)
			setRequests(Array.isArray(res?.data) ? res.data : [])
		} catch (e) {
			console.error(e)
			toast.error(e?.message || 'Failed to fetch requests')
			setRequests([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		let abortController = new AbortController()
		if (!isAuthenticated) return

		loadRequests({ signal: abortController.signal })

		return () => {
			abortController.abort()
		}
	}, [isAuthenticated, role])

	const handleAccept = async (requestId) => {
		try {
			setActionLoading(true)
			const res = await acceptSubmerchantRequestService(requestId)
			toast.success(res?.message || 'Request accepted')
			await loadRequests()
		} catch (e) {
			console.error(e)
			toast.error(e?.message || 'Failed to accept request')
		} finally {
			setActionLoading(false)
		}
	}

	const handleReject = async (requestId) => {
		try {
			setActionLoading(true)
			const res = await rejectSubmerchantRequestService(requestId)
			toast.success(res?.message || 'Request rejected')
			await loadRequests()
		} catch (e) {
			console.error(e)
			toast.error(e?.message || 'Failed to reject request')
		} finally {
			setActionLoading(false)
		}
	}

	return (
		<div className="py-16 w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
			<div className='w-full max-w-[1200px] px-6 flex flex-col items-stretch space-y-6'>
				<div className='text-center text-3xl font-medium text-black'>Submerchant Requests</div>

						<div className='w-full space-y-3'>
							{loading ? (
								<div className='w-full text-center text-gray-600'>Loading...</div>
							) : requests.length === 0 ? (
								<div className='w-full text-center text-gray-600'>No pending requests</div>
							) : (
								requests.map((request) => (
									<RequestCard
										key={request?.id}
										request={request}
										acceptDisabled={acceptDisabled}
										actionLoading={actionLoading}
										onAccept={handleAccept}
										onReject={handleReject}
									/>
								))
							)}
						</div>
			</div>
		</div>
	)
}

export default SubmerchantRequests
