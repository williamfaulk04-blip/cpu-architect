import React from 'react';
import ReactDOM from 'react-dom/client';
import GpuGame from '../../components/gpu-game';
import '../../app/globals.css';
import '../../app/guided.css';
import '../../app/interior.css';
import '../../app/explorer.css';
import '../../app/gpu.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GpuGame />
  </React.StrictMode>,
);
