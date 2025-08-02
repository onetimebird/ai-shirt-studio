import { initializeTextControls } from "@/lib/fabricTextControls";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize text controls immediately - Vite handles DOM readiness
console.log('🚀 Starting text controls initialization immediately...');
initializeTextControls().then(() => {
  console.log('🎉 Text controls initialization completed successfully!');
}).catch(error => {
  console.error('❌ Failed to initialize text controls in main.tsx:', error);
});

createRoot(document.getElementById("root")!).render(<App />);