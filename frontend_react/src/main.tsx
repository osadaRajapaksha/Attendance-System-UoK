import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider as AsgardeoAuthProvider } from "@asgardeo/auth-react";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AsgardeoAuthProvider
        config={{
            signInRedirectURL: "http://localhost:5173/",
            signOutRedirectURL: "http://localhost:5173/",
            clientID: "n9EiAR44_YLH0PFWIYfFYPjeffAa",
            baseUrl: "https://api.asgardeo.io/t/attendanceuok",
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
