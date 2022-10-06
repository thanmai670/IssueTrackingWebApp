import { signupUser } from '../ViewModels/Signup';
import '../styles/Signup.scss';
import { useNavigate } from 'react-router-dom';
import { bordMainSetup } from '../ViewModels/Board';
import { useEffect } from 'react';
import { jwtSet } from '../util';

export function App() {
    let navigate = useNavigate();
    let pass = '';
    let passCon = '';
    let username = 'Username';
    let email = 'Emil';

    useEffect(() => {
        if (jwtSet()) {
            navigate('/board');
        }
    }, []);

    const getUserValue = (event: any) => {
        // show the user input value to console
        username = event.target.value;
    };
    const setPassValue = (event: any) => {
        // show the user input value to console
        pass = event.target.value;
    };
    const setPassConValue = (event: any) => {
        // show the user input value to console
        passCon = event.target.value;
    };
    const setEmail = (event: any) => {
        // show the user input value to console
        email = event.target.value;
    };

    return (
        <div className="signup-box">
            <h2>SignUP</h2>
            <form>
                <div className="signup-form">
                    <input id="username" onChange={getUserValue} placeholder={username}></input>
                    <label className="label">User Name</label>
                </div>
                <div className="signup-form">
                    <input id="email" onChange={setEmail} placeholder={email}></input>
                    <label className="label">Email</label>
                </div>
                <div className="signup-form">
                    <input id="password" type={'password'} onChange={setPassValue} placeholder={pass}></input>
                    <label className="label">Password</label>
                </div>
                <div className="signup-form">
                    <input id="confirmpassword" type={'password'} onChange={setPassConValue} placeholder={passCon} />
                    <label className="label">Confirm Password</label>
                </div>
                <button
                    onClick={() => {
                        navigate('/');
                    }}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    Cancel
                </button>
                <button
                    id="signup"
                    onClick={async (e) => {
                        e.preventDefault();
                        if (pass != passCon) {
                            alert("password and confirmation dosn't match");
                        } else if (await signupUser(username, pass, email)) {
                            navigate('/board');
                        } else {
                            alert('improper login info');
                        }
                    }}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    Sign Up
                </button>
            </form>
        </div>
    );
}

export default App;
