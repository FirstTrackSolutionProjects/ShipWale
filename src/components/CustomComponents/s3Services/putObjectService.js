
const putObjectService = async (putURL, file, filetype) => {
    if (!putURL || !file || !filetype) {
        throw new Error('Filename and filetype are required');
    }
    try{
        const response = await fetch(putURL, {
            method: 'PUT',
            headers: {
                'Content-Type': filetype,
            },
            body: file
        });

        if (!response.ok){
            throw new Error(data?.message || 'Something went wrong');
        }
    } catch (error) {
        console.error(error);
        throw new Error('Unexpected error occurred');
    }
}

export default putObjectService;