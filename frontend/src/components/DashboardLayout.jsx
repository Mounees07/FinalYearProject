import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <Navbar />
                <div className="page-content animate-fade-in">
                    {children || <Outlet />}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
