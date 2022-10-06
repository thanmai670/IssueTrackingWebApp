import { useNavigate } from 'react-router-dom';
import { userID, setUserID } from '../ViewModels/Get';
interface LoginData {
    jsx: string;
}

export async function authenticateMe(userName: string, userPass: string, email: string) {
    var result = await getUsers(userName, userPass, email);
    if (result.jwt === undefined) return false;

    setUserID(result._id);
    localStorage.setItem('jwt', result.jwt);
    return true;
}

export async function getUsers(userName: string, userPass: string, email: string) {
    var url = `${process.env.REACT_APP_BASE_API_URI}/login`;
    try {
        /*const requestOptions = {
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTQ1Mjg2MTAsImlzcyI6InRlc3QxIn0.-2xZYUqMpQBbAScKeVVx1sjpPKrtLFRP8A9hDxYpIiZtW3NwdZKSWIRA_00IuwC8WR1SNLgUw9AvfU99XUr97g`,
            }),
        };
        console.log(await fetch(url, requestOptions).then((data) => {
            return data.json();
        }));*/

        const requestOptions = {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ email: email, password: userPass }),
        };
        console.log(requestOptions);

        return await fetch(url, requestOptions).then(async (data) => {
            const res = await data.json();

            return res;
        });

        /*
        let result = fetch(url, requestOptions).then((data) => {
            return data.json();
        });

        return result;*/
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
