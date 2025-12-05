import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_APP_API_URL

const WalletRechargeModal = ({ onClose }) => {
    const [amount, setAmount] = useState(500);
    // Show Razorpay payment_id to the user after payment completes
    const [paymentId, setPaymentId] = useState(null);
    const { id, name, business_name, email, phone } = useAuth()
    const { refreshBalance } = useWallet();
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const displayRazorpay = async () => {
        // if (parseInt(amount) < 500){
        //   return;
        // }
        const response = await fetch(`${API_URL}/wallet/razorpay/CreateOrderId`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
            headers: {
                'Content-Type': 'application/json'
            },
        });
    const data = await response.json();

        const res = await loadRazorpayScript();

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }


        const options = {
            key: import.meta.env.VITE_APP_RAZORPAY_API_ID, // Replace with your Razorpay key ID
            amount: amount * 100, // Amount is in paise (50000 paise = INR 500)
            currency: 'INR',
            name: `${business_name} (${name})`,
            description: 'Wallet Recharge',
            image: '/image/logo-nobg.png',
            order_id: data.id,
            handler: async function (response) {
                // Always show the payment_id to the user, even if verification fails
                setPaymentId(response.razorpay_payment_id);

                const verifyResponse = await fetch(`${API_URL}/wallet/verify/recharge`, {
                    method: 'POST',
                    body: JSON.stringify({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        uid: id,
                        amount: amount,
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                const verifyData = await verifyResponse.json();
                if (!verifyData.success) {
                    toast.error('Failed to recharge wallet. Please contact us with payment_id if any amount is deducted from your bank account.')
                } else {
                    await refreshBalance();
                    toast.success('Wallet recharged successfully')
                }
            },
            prefill: {
                name: `${business_name} (${name})`,
                email: email,
                contact: phone,
            },
            notes: {
                address: 'Corporate Office',
            },
            theme: {
                color: '#3399cc',
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    };
    return (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-[rgba(0,0,0,0.5)]'>
            <form className='relative mx-2 w-full sm:w-[500px] flex flex-col items-center bg-white rounded-2xl p-8 space-y-8' onSubmit={(e) => { e.preventDefault(); displayRazorpay() }}>
                <div className='absolute right-6 hover:bg-red-500 w-7 h-7 rounded-full flex items-center justify-center hover:text-white cursor-pointer' onClick={onClose}>
                    X
                </div>
                <div className='text-2xl font-medium text-center'>Wallet Recharge</div>

                {paymentId && (
                    <div className='w-full text-xs sm:text-sm bg-red-50 border border-red-200 text-red-900 rounded-md p-2 break-all'>
                        <div className='flex items-center justify-between gap-2'>
                            <span>Payment ID:</span>
                            <span className='font-mono'>{paymentId}</span>
                            <button
                                type='button'
                                className='text-red-700 hover:underline whitespace-nowrap'
                                onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(paymentId); }}
                                title='Copy Payment ID'
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                )}

                <input
                    type="number"
                    value={amount}
                    min={100}
                    onChange={(e) => setAmount(e.target.value)}
                    className='w-full border py-2 px-4 rounded'
                />
                <div className='flex w-full justify-evenly'>
                    <button className='w-20 border py-2 px-4 rounded hover:bg-red-500 hover:text-white' onClick={() => { setAmount(500) }}>500</button>
                    <button className='w-20 border py-2 px-4 rounded hover:bg-red-500 hover:text-white' onClick={() => { setAmount(1000) }}>1000</button>
                    <button className='w-20 border py-2 px-4 rounded hover:bg-red-500 hover:text-white' onClick={() => { setAmount(2000) }}>2000</button>
                </div>
                <button type='submit' className='w-40 border py-2 px-4 rounded hover:text-white hover:bg-red-500'>Recharge Wallet</button>
            </form>
        </div>
    )
}

export default WalletRechargeModal
