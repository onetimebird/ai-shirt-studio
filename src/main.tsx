import { initializeTextControls } from "@/lib/fabricTextControls";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize text controls when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM loaded, initializing text controls...');
  initializeTextControls().catch(error => {
    console.error('❌ Failed to initialize text controls in main.tsx:', error);
  });
});

createRoot(document.getElementById("root")!).render(<App />);