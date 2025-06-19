import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';
import logo from '../images/logo.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserData';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { setUserId } = useUser();

    const verifyCaptcha = async (token) => {
            const response = await fetch('http://localhost:5000/verify-recaptcha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            return await response.json();
        };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!captchaToken) {
            setErrorMessage("Please complete the Captcha!");
            return;
        }

        if (!email) {
            setErrorMessage("Please don't leave the email empty.");
            return;
        }

        if (!password) {
            setErrorMessage("Please don't leave the password empty.");
            return;
        }

        const loginData = { email, password};
        const captchaResult = await verifyCaptcha(captchaToken);

        if (!captchaResult.success) {
            setErrorMessage("reCAPTCHA verification failed.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/verify-user-input', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (data.success) {
                alert(`Login Successfully! ${data.message} ${data.username}!`);
                setUserId(data.user_id)
                console.log('User ID:', data.user_id);
                navigate('/weather');
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(error.message);
        }
    };

    const handleCaptchaChange = async(token) => {
        setCaptchaToken(token);
    };

    return (
        <div className="container vh-100 d-flex align-items-center justify-content-center">
            <div className="row shadow-lg rounded-4 overflow-hidden w-90">
                {/* left container login intro */}
                <div className="col-lg-6 d-none d-lg-flex text-center flex-column justify-content-center align-items-center bg-dark text-white p-5">
                    <img src={logo} alt="Logo" className="mb-4" style={{ width: '300px' }} />
                    <h1 className="mb-4">Welcome to Global Sence!</h1>
                    <p>Log in to explore the weather of countries on this platform and save the weather information for your preferred locations.</p>
                </div>

                {/* right container login form */}
                <div className="col-lg-6 p-5">
                    <p className="text-end">
                        Don't have an account? <Link to="/signup">Signup</Link>
                    </p>
                    <h2 className="text-center mb-4">Login</h2>

                    {/* display error message */}
                    {errorMessage && <div className="mt-3 alert alert-danger w-100 text-center">{errorMessage}</div>}

                    {/* login form container */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email:</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password:</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                className="form-control"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-check form-switch mb-3">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="showPasswordToggle"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <label htmlFor="showPasswordToggle" className="form-check-label ms-2">
                                Show Password
                            </label>
                        </div>

                        <div className="mb-3">
                            <ReCAPTCHA
                                sitekey="6LfPW2YrAAAAAMTKF8zG9CuRQOU4MFooq1owyKkj"
                                onChange={handleCaptchaChange}
                            />
                        </div>
                        <div className="d-flex align-items-center justify-content-center">
                            <button type="submit" className="btn btn-primary w-50">Log In</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    );
}

export default Login;
