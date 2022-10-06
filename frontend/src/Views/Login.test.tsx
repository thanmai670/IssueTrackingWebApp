import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './Login';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';

test('renders login text', () => {
    render(
        <Router>
            <App />
        </Router>
    );
    let log = screen.getAllByText(/Login/i)[0];
    expect(log).toBeInTheDocument();
});

test('renders Sign up text', () => {
    render(
        <Router>
            <App />,
        </Router>
    );
    const sgnup = screen.getByText(/Signup/i);
    expect(sgnup).toBeInTheDocument();
});

test('renders Email text', () => {
    render(
        <Router>
            <App />,
        </Router>
    );
    const email = screen.getByText(/Username/i);
    expect(email).toBeInTheDocument();
});

test('renders Password text', () => {
    render(
        <Router>
            <App />,
        </Router>
    );
    const pass = screen.getByText(/Password/i);
    expect(pass).toBeInTheDocument();
});
