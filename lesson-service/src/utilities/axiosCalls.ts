import axios from 'axios';




export const fetchEdedunLanguage = async (englishText?: string, yorubaText?: string) => {
    try {
        const params = new URLSearchParams();

        if (englishText) {
            params.append('englishText', englishText);
        }
        if (yorubaText) {
            params.append('yorubaText', yorubaText);
        }

        const queryString = params.toString();
        const url = `http://localhost:3006/admin/recordings-for-zabbot${queryString ? '?' + queryString : ''}`;

        const response = await axios.get(url);

        return {
            success: true,
            statusCode: response.status,
            data: response.data.data,
            message: response.data.message || 'Fetched successfully',
        };

    } catch (error: any) {
        return {
            success: false,
            statusCode: error.response?.status || 500,
            data: null,
            message: error.response?.data?.message || error.message || 'Failed to fetch from Ededun',
        };
    }
}

export const fetchSingleUser = async (userId:string, projection?:string[]) => {
    try{
         const params = new URLSearchParams();

        if (projection) {
            params.append('projection', JSON.stringify(projection));
        }

        const queryString = params.toString();
        const url = `http://localhost:3004/users/single-user/${userId}${queryString ? '?' + queryString : ''}`;

        const response = await axios.get(url);

        return {
            success: true,
            statusCode: response.status,
            data: response.data.data,
            message: response.data.message || 'Fetched successfully',
        };
    }catch(error:any){
        return {
            success: false,
            statusCode: error.response?.status || 500,
            data: null,
            message: error.response?.data?.message || error.message || 'Failed to fetch from Ededun',
        };
    }
}
