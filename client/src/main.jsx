import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/theme.css';
import './styles/fold.css';
import './styles/asset-placement.css';
import './styles/ux-polish.css';
import './styles/quick-mystic.css';
import './styles/unified-nav.css';
import './styles/refined-design.css';

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
);
