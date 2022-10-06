export var userID: string;
export function setUserID(val: string) {
    userID = val;
}

export async function getGeneric(url: string, action: string) {
    var token = localStorage.getItem('jwt');
    //token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTQ1OTM1ODgsImlzcyI6InRlc3QxIn0.ZD3dZLVQoR5mPc4P7nRkaW7fmG9OcsgFwk7n0NYpPjr8oRUhrJRhIyH8Rbc1duyADZ_QXzGVoAx2wWZCmwb61A";

    try {
        const requestOptions = {
            method: action,
            headers: new Headers({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }),
        };

        return await fetch(url, requestOptions).then((data) => {
            return data.json();
        });
    } catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            return error.message;
        } else {
            console.log('unexpected error: ', error);
            return 'An unexpected error occurred';
        }
    }
}
