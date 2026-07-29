import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider as AsgardeoAuthProvider } from "@asgardeo/auth-react";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AsgardeoAuthProvider
        config={{
            signInRedirectURL: "http://localhost:5173/auth/callback",
            signOutRedirectURL: "http://localhost:5173/auth/callback",
            clientID: "tgF0U4nZqNQMTh5LnT87gnbCE1ka",
            baseUrl: "https://api.eu.asgardeo.io/t/attendancesystem",
            scope: [ "openid", "profile", "email" ]
        }}
    >
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
    </AsgardeoAuthProvider>
  </React.StrictMode>,
);
