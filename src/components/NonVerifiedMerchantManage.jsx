import getUnverifiedUserService from '@/services/userServices/getUnverifiedUserService'
import { useEffect , useState  } from 'react'


const Card = ({merchant}) => {
    // const [view, setView] = useState(false)
    return (
        <>
            {/* { view && <View {...merchant} merchant={merchant} setView={setView} />} */}
            <div className='p-4 border'>
                <p>User Id : {merchant.uid}</p>
                <p>Name : {merchant.fullName}</p>
                <p>Phone : {merchant.phone}</p>
                <p>Email : {merchant.email}</p>
                <p>Created At: {new Date(merchant.createdAt).toLocaleString()}</p>
            </div>  
        </>
    )
}



const MerchantManage =  () => {
    const [merchants, setMerchants] = useState([])
    useEffect(() => {
        const getVerifiedMerchant = async () => {
            const data = await getUnverifiedUserService();
            setMerchants(data || [])
        }
        getVerifiedMerchant();
    },[]);
  return (
    <>
    <div className=" py-16 w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
      <div className='w-full p-8 flex flex-col items-center space-y-8'>
      <div className='text-center text-3xl font-medium text-black'>Non-Verified Merchants</div>
      <div className='w-full bg-white p-8'>
        {merchants.length > 0 ? (
        merchants.map(((merchant,index)=>(
            <Card key={index}  merchant={merchant}/>
        )))
      ) : (
        null
      )}
      </div>
      </div>
    </div>
    </>
  )
}

export default MerchantManage
