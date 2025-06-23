import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import { store, persistor } from './store';
import './assets/fonts/fonts.css';
import './index.css';
import './i18n';

// Set locale to ensure consistent AM/PM time format
if (navigator.language !== 'en-US') {
  // Force locale to en-US for consistent AM/PM display
  document.documentElement.lang = 'en-US';
  
  // This helps browsers know we want en-US formatting
  const htmlLangMeta = document.createElement('meta');
  htmlLangMeta.setAttribute('http-equiv', 'Content-Language');
  htmlLangMeta.setAttribute('content', 'en-US');
  document.head.appendChild(htmlLangMeta);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);
