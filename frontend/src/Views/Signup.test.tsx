import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './Signup';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';

test('renders User Name text', () => {
    render(
        <Router>
            <App />,
        </Router>
    );
    let usr = screen.getAllByText(/User Name/i)[0];
    expect(usr).toBeInTheDocument();
});

test('renders Email text', () => {
    render(
        <Router>
            <App />,
        </Router>
    );
    const Email = screen.getByText(/Email/i);
    expect(Email).toBeInTheDocument();
});

test('renders password text', () => {
    render(
        <Router>
            <App />,
        </Router>
    );
    let password = screen.getAllByText(/Password/i)[0];
    expect(password).toBeInTheDocument();
});

test('renders  Confirm Password text', () => {
    render(
        <Router>
            <App />,
        </Router>
    );
    const ConPasswd = screen.getByText(/Confirm Password/i);
    expect(ConPasswd).toBeInTheDocument();
});

test('  contains Sign Up text', () => {
    render(
        <Router>
            <App />,
        </Router>
    );
    const SgnUp = screen.getByText(/Sign Up/i);
    expect(SgnUp).toBeInTheDocument();
});
