import './index.scss';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './Views/Login';
import Board from './Views/Board';
import Signup from './Views/Signup';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
    <div>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/Board" element={<Board />} />
                <Route path="/Signup" element={<Signup />} />
            </Routes>
        </BrowserRouter>
    </div>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
