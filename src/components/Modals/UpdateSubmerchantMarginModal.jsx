import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import updateSubmerchantMarginService from '@/services/merchantServices/updateSubmerchantMarginService';

const UpdateSubmerchantMarginModal = ({
	open,
	onClose,
	submerchantId,
	currentMargin,
	onSuccess,
}) => {
	const initialValue = useMemo(() => {
		if (currentMargin === undefined || currentMargin === null || currentMargin === '') return '';
		return String(currentMargin);
	}, [currentMargin]);

	const [margin, setMargin] = useState(initialValue);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setMargin(initialValue);
	}, [initialValue, open]);

	if (!open) return null;

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!submerchantId) {
			toast.error('Submerchant ID missing');
			return;
		}

		const marginNumber = Number(margin);
		if (!Number.isFinite(marginNumber) || marginNumber < 0) {
			toast.error('Please enter a valid margin (>= 0)');
			return;
		}

		setIsSubmitting(true);
		try {
			await updateSubmerchantMarginService({ submerchant_id: submerchantId, margin: marginNumber });
			toast.success('Margin updated successfully');
			onSuccess?.();
			onClose?.();
		} catch (err) {
			toast.error(err?.message || 'Failed to update margin');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md relative max-h-[80%] overflow-hidden">
				<button
					className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
					onClick={() => {
						if (!isSubmitting) onClose?.();
					}}
				>
					&times;
				</button>
				<h1 className="text-xl text-center my-4 font-bold">UPDATE MARGIN</h1>
				<div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 2rem)' }}>
					<form onSubmit={handleSubmit} className="flex flex-col space-y-6">
						<div className="flex flex-col">
							<label htmlFor="margin" className="font-semibold">
								Margin (%)
							</label>
							<input
								type="number"
								name="margin"
								id="margin"
								className="border-2 py-2 px-4 rounded-full"
								placeholder="Margin"
								min={0}
								step="0.01"
								required
								value={margin}
								onChange={(e) => setMargin(e.target.value)}
								disabled={isSubmitting}
							/>
						</div>

						<button
							type="submit"
							className={`w-full px-4 py-2 mt-4 rounded-full text-white bg-red-500 hover:bg-red-700 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Updating…' : 'Submit'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default UpdateSubmerchantMarginModal;
