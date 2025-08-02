// Immediate console log to test if main.tsx executes
console.log('📦 MAIN.TSX LOADED - THIS SHOULD APPEAR FIRST');

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('📦 All imports successful, about to render app');

createRoot(document.getElementById("root")!).render(<App />);

console.log('📦 App rendered, now initializing controls...');

// Simplified initialization without async import complexity
import { initializeTextControls } from "@/lib/fabricTextControls";

console.log('🚀 Text controls import successful, calling function...');
initializeTextControls().then(() => {
  console.log('🎉 Text controls initialization completed!');
}).catch(error => {
  console.error('❌ Text controls failed:', error);
});
