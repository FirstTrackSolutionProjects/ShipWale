const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

const getPutObjectUrlService = async (filename, filetype, isPrivate) => {
    if (!filename || !filetype) {
        throw new Error('Filename and filetype are required');
    }
    let data;
    try{
        const response = await fetch(`${BACKEND_URL}/s3/put-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename,
                filetype,
                isPrivate
            }),
        });

        data = await response.json();

        if (!data.success){
            throw new Error(data?.message || 'Something went wrong');
        }

        return data?.data;
    } catch (error) {
        console.error(error);
        throw new Error('Unexpected error occurred');
    }
}

export default getPutObjectUrlService;