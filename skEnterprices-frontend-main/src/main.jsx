import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/**
 * main.jsx - Entry point of the React application
 * 
 * WHAT IT DOES:
 * - Renders the root App component into the DOM
 * - Initializes React application
 * - Enables React StrictMode for development warnings
 * 
 * FLOW:
 * 1. Browser loads index.html → finds <div id="root">
 * 2. This script runs → ReactDOM.createRoot() finds root element
 * 3. Renders <App /> component into root element
 * 4. App component renders → entire application is displayed
 * 
 * WHAT HAPPENS NEXT:
 * - App component mounts → sets up routing and providers
 * - User sees the application interface
 * - Navigation and interactions begin
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode enables additional checks and warnings in development
  // Helps identify potential problems in the application
  <React.StrictMode>
    {/* App component is the root of our component tree */}
    {/* All other components are children of App */}
    <App />
  </React.StrictMode>,
)

