import { initializeTextControls } from "@/lib/fabricTextControls";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize text controls when app starts
initializeTextControls();

createRoot(document.getElementById("root")!).render(<App />);