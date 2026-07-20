import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import { AuthProvider as CustomAuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider as AsgardeoAuthProvider } from "@asgardeo/auth-react";

const isLocal = window.location.hostname === 'localhost';
const siteUrl = isLocal ? 'http://localhost:5173' : 'http://attendance-system-uok-frontend-scxk9wwq.s3-website-us-east-1.amazonaws.com';

const asgardeoConfig = {
  signInRedirectURL: siteUrl + "/login",
  signOutRedirectURL: siteUrl + "/login",
  clientID: "nSf4bAcMaaBhMfHMx37nxE3K6k0a",
  baseUrl: "https://api.asgardeo.io/t/attendanceuok",
  scope: ["openid", "profile", "email"]
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AsgardeoAuthProvider config={asgardeoConfig}>
      <BrowserRouter>
        <CustomAuthProvider>
          <App />
        </CustomAuthProvider>
      </BrowserRouter>
    </AsgardeoAuthProvider>
  </React.StrictMode>,
);
