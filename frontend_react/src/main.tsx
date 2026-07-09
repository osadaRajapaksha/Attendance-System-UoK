import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import { AuthProvider as CustomAuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider as AsgardeoAuthProvider } from "@asgardeo/auth-react";

const asgardeoConfig = {
  signInRedirectURL: window.location.origin + "/login",
  signOutRedirectURL: window.location.origin + "/login",
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
