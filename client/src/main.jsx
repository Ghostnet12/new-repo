import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/theme.css';
import './styles/fold.css';
import './styles/hero-asset.css';
import './styles/panel-info-asset.css';
import './styles/panel-guide-asset.css';
import './styles/card-back-asset.css';
import './styles/asset-placement.css';

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
);
