import { getUsers } from '../ViewModels/Login';
import { userID, setUserID } from '../ViewModels/Get';

export async function signupUser(userName: string, userPass: string, email: string) {
    var url = `${process.env.REACT_APP_BASE_API_URI}/register`;
    try {
        const requestOptions = {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ username: userName, password: userPass, passwordCheck: userPass, email: email }),
        };

        await fetch(url, requestOptions).then((data) => {
            return data.json();
        });

        var result = await getUsers(userName, userPass, email);
        if (result.jwt == undefined) {
            return false;
        } else {
            setUserID(result._id);
            localStorage.setItem('jwt', result.jwt);
            return true;
        }
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
