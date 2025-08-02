// Test if imports are working
console.log('📦 main.tsx loaded');

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize text controls with better error handling
console.log('🚀 Starting text controls initialization...');

async function initControls() {
  try {
    console.log('🔍 Attempting to import text controls...');
    const { initializeTextControls } = await import("@/lib/fabricTextControls");
    console.log('✅ Text controls imported successfully:', typeof initializeTextControls);
    console.log('🔧 Function imported, calling initializeTextControls...');
    await initializeTextControls();
    console.log('🎉 Text controls initialization completed!');
  } catch (error) {
    console.error('❌ Text controls initialization failed:', error);
    console.error('❌ Stack trace:', error.stack);
  }
}

initControls();

createRoot(document.getElementById("root")!).render(<App />);