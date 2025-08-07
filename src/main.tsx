// Immediate console log to test if main.tsx executes
console.log('📦 MAIN.TSX LOADED - THIS SHOULD APPEAR FIRST');

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('📦 All imports successful, rendering app...');

createRoot(document.getElementById("root")!).render(<App />);

console.log('📦 App rendered successfully! Now initializing text controls...');

// Import and initialize text controls
import('./lib/fabricTextControls').then(module => {
  console.log('🔧 Text controls module imported successfully');
  return module.initializeTextControls();
}).then(() => {
  console.log('🎉 Text controls initialized successfully!');
}).catch(error => {
  console.error('❌ Text controls failed:', error);
});
