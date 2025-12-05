import { useMemo, useState } from 'react'
import getMerchantInvoiceService from '../../services/invoiceServices/getMerchantInvoiceService'
import generateMonthlyInvoiceHtml from '../../utils/invoice/generateMonthlyInvoiceHtml'
import downloadPdfFromHtml from '../../utils/invoice/downloadPdfFromHtml'

const months = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 }
]

const currentYear = new Date().getFullYear()

const MerchantInvoiceModal = ({ open, onClose, merchantId }) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(currentYear)
  const [loading, setLoading] = useState(false)
  const years = useMemo(() => {
    const arr = []
    for (let y = currentYear; y >= currentYear - 5; y--) arr.push(y)
    return arr
  }, [])

  if (!open) return null

  const submit = async (e) => {
    e.preventDefault()
    if (!merchantId) return
    try {
      setLoading(true)
      const data = await getMerchantInvoiceService({ merchantId, month, year })
  const html = generateMonthlyInvoiceHtml(data)
  const filename = `Invoice-SWINV${merchantId}${year}${String(month).padStart(2,'0')}.pdf`
  await downloadPdfFromHtml(html, filename)
      setLoading(false)
      onClose && onClose()
    } catch (err) {
      console.error(err)
      alert(err?.message || 'Failed to generate invoice')
      setLoading(false)
    }
  }

  return (
    <div className='absolute inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex justify-center items-center overflow-y-auto'>
      <div className='relative p-6 w-[400px] bg-white rounded-2xl overflow-hidden space-y-5'>
        <p className='absolute top-4 right-5 cursor-pointer' onClick={onClose}>X</p>
        <p className='text-xl font-semibold text-center'>Generate Monthly Invoice</p>
        <form className='space-y-4' onSubmit={submit}>
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col'>
              <label className='text-sm text-gray-600 mb-1'>Month</label>
              <select
                className='border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-400'
                value={month}
                onChange={(e)=>setMonth(Number(e.target.value))}
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className='flex flex-col'>
              <label className='text-sm text-gray-600 mb-1'>Year</label>
              <select
                className='border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-400'
                value={year}
                onChange={(e)=>setYear(Number(e.target.value))}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className='flex justify-end space-x-2 pt-2'>
            <button type='button' className='px-4 py-2 rounded bg-gray-200' onClick={onClose}>Cancel</button>
            <button type='submit' className={`px-4 py-2 rounded text-white ${loading ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500'}`} disabled={loading}>
              {loading ? 'Generating…' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MerchantInvoiceModal
