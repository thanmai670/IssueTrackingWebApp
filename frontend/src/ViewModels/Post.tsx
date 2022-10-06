export var userID = '629e0005f0c3c9e68dcd2a82';

export async function postGeneric(url: string, Jbody: any, keyWord: string) {
    var token = localStorage.getItem('jwt');
    //token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTQ1OTM1ODgsImlzcyI6InRlc3QxIn0.ZD3dZLVQoR5mPc4P7nRkaW7fmG9OcsgFwk7n0NYpPjr8oRUhrJRhIyH8Rbc1duyADZ_QXzGVoAx2wWZCmwb61A";

    const requestOptions = {
        method: keyWord,
        headers: new Headers({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }),
        body: JSON.stringify(Jbody),
    };

    return await fetch(url, requestOptions).then((data) => {
        return data.json();
    });
}
