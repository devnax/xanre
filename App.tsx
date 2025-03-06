import React from 'react';
import { createRoot } from 'react-dom/client';
import Count from './src'

const App = () => {
  return (
    <Count />
  );
}
const rootEle = document.getElementById('root')
if (rootEle) {
  const root = createRoot(rootEle);
  root.render(<App />);
}
