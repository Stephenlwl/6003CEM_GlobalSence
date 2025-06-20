import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './Signup.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../images/logo.jpg';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { username, email, password, confirmPassword } = formData;

        if (username.length < 8 || /[^a-zA-Z0-9]/.test(username)) {
            setErrorMessage("Username must be at least 8 characters, no special characters.");
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        if (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
            setErrorMessage("Password must be at least 8 characters long and contain at least one number and one special character.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;
        }

        const user_id = uuidv4(); // for generating a unique user_id
        const signupData = { user_id, username, email, password };

        try {

            const response = await fetch('http://localhost:5000/save-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupData),
            });

            const data = await response.json();

            if (data.success) {
                alert(`Signup Successfully! Welcome ${username}!`);
                setErrorMessage('');
                navigate('/login');
            } else {
                setErrorMessage('');
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(`Error: ${error.message}`);
        }
    }


    return (
        <div className="container mt-5 mb-5 vh-100 d-flex align-items-center justify-content-center">
            <div className="row shadow-lg rounded-4 overflow-hidden w-100">
                {/* left container registration intro */}
                <div className="col-lg-6 d-none d-lg-flex text-center flex-column justify-content-center align-items-center bg-dark text-white p-5">
                    <img src={logo} alt="Logo" className="mb-4" style={{ width: '300px' }} />
                    <h3 className="mb-4">Create an Account and Start Exploring Weather Around the World!</h3>
                    <p>Got an account already? Log in and start your weather adventure!</p>
                </div>

                {/* right container registration form */}
                <div className="col-lg-6 p-5 d-flex flex-column">
                    <div className="w-100" style={{ maxWidth: '500px', margin: '0 auto' }}>

                        <p className="text-end">
                            Already have an account? <Link to="/login">Login</Link>
                        </p>
                        <h2 className="text-center mb-4">Signup</h2>

                        {/* display error message */}
                        {errorMessage && <div className="alert alert-danger w-100">{errorMessage}</div>}


                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">Username:</label>
                                <input
                                    type="text"
                                    name="username"
                                    id="username"
                                    className="form-control"
                                    placeholder="Enter username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                                <div className="form-text">*Must be at least 8 characters, no special characters.</div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    className="form-control"
                                    placeholder="...@gmail.com"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Password:</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    id="password"
                                    className="form-control"
                                    placeholder="Enter password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <div className="form-check form-switch mt-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="showPassword"
                                        checked={showPassword}
                                        onChange={() => setShowPassword(!showPassword)}
                                    />
                                    <label className="form-check-label ms-2" htmlFor="showPassword">Show Password</label>
                                </div>
                                <div className="form-text">*At least 8 characters with 1 number and 1 special character.</div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="confirmPassword" className="form-label">Confirm Password:</label>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    className="form-control"
                                    placeholder="Confirm password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <div className="form-check form-switch mt-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="showConfirmPassword"
                                        checked={showConfirmPassword}
                                        onChange={() => setShowConfirmPassword(!showConfirmPassword)}
                                    />
                                    <label className="form-check-label ms-2" htmlFor="showConfirmPassword">Show Confirm Password</label>
                                </div>
                            </div>

                            <div className="d-flex align-items-center justify-content-center">
                                <button type="submit" className="btn btn-primary w-50">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Signup;
