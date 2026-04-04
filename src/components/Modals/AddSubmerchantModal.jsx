import { useState } from 'react';
import { toast } from 'react-toastify';

import checkUserExistsByEmailService from '@/services/userServices/checkUserExistsByEmailService';
import requestSubmerchantsService from '@/services/merchantServices/requestSubmerchantService';

const AddSubmerchantModal = ({ open, onClose, onSuccess }) => {
	if (!open) return;

	const [email, setEmail] = useState('');
	const [fullName, setFullName] = useState('');
	const [phone, setPhone] = useState('');
	const [showDetails, setShowDetails] = useState(false);
	const [loading, setLoading] = useState(false);

	const reset = () => {
		setEmail('');
		setFullName('');
		setPhone('');
		setShowDetails(false);
	};

	const handleClose = () => {
		if (loading) return;
		reset();
		onClose?.();
	};

	const handleEmailSubmit = async (e) => {
		e.preventDefault();
		if (!email) {
			toast.error('Email is required');
			return;
		}

		setLoading(true);
		try {
			const exists = await checkUserExistsByEmailService({ email });
			if (exists) {
				await requestSubmerchantsService({ email });
				toast.success('Submerchant request created successfully');
				handleClose();
				onSuccess?.();
				return;
			}

			setShowDetails(true);
		} catch (err) {
			toast.error(err?.message || 'Failed to process request');
		} finally {
			setLoading(false);
		}
	};

	const handleDetailsSubmit = async (e) => {
		e.preventDefault();
		if (!email) {
			toast.error('Email is required');
			return;
		}
		if (!fullName || !phone) {
			toast.error('Full name and phone are required');
			return;
		}

		setLoading(true);
		try {
			await requestSubmerchantsService({ email, fullName, phone });
			toast.success('Submerchant request created successfully');
			handleClose();
			onSuccess?.();
		} catch (err) {
			toast.error(err?.message || 'Failed to create submerchant request');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
			<div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md relative max-h-[80%] overflow-hidden">
				<button
					className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
					onClick={handleClose}
					disabled={loading}
				>
					&times;
				</button>
				<h1 className="text-xl text-center my-4 font-bold">ADD SUBMERCHANT</h1>

				<div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 2rem)' }}>
					<form
						onSubmit={showDetails ? handleDetailsSubmit : handleEmailSubmit}
						className="flex flex-col space-y-6"
					>
						<div className="flex flex-col">
							<label htmlFor="submerchant_email" className="font-semibold">Email</label>
							<input
								id="submerchant_email"
								type="email"
								className="border-2 py-2 px-4 rounded-full"
								placeholder="Email"
								required
								disabled={loading}
								value={email}
								onChange={(e) => {
									const next = e.target.value;
									setEmail(next);
									if (showDetails) {
										setShowDetails(false);
										setFullName('');
										setPhone('');
									}
								}}
							/>
						</div>

						{showDetails && (
							<>
								<div className="flex flex-col">
									<label htmlFor="submerchant_fullName" className="font-semibold">Full Name</label>
									<input
										id="submerchant_fullName"
										type="text"
										className="border-2 py-2 px-4 rounded-full"
										placeholder="Full Name"
										required
										disabled={loading}
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
									/>
								</div>

								<div className="flex flex-col">
									<label htmlFor="submerchant_phone" className="font-semibold">Phone</label>
									<input
										id="submerchant_phone"
										type="tel"
										className="border-2 py-2 px-4 rounded-full"
										placeholder="Phone"
										required
										disabled={loading}
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
									/>
								</div>
							</>
						)}

						<button
							type="submit"
							disabled={loading}
							className={`w-full px-4 py-2 mt-4 rounded-full text-white bg-red-500 hover:bg-red-700 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
						>
							{loading ? 'Please wait…' : (showDetails ? 'Submit' : 'Continue')}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default AddSubmerchantModal;
