// Immediate console log to test if main.tsx executes
console.log('📦 MAIN.TSX LOADED - THIS SHOULD APPEAR FIRST');

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('📦 All imports successful, rendering app...');

createRoot(document.getElementById("root")!).render(<App />);

console.log('📦 App rendered successfully!');
