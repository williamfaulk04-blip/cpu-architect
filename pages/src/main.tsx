import React from 'react';
import ReactDOM from 'react-dom/client';
import CpuGame from '../../components/cpu-game';
import '../../app/globals.css';
import '../../app/guided.css';
import '../../app/interior.css';
import '../../app/explorer.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CpuGame />
  </React.StrictMode>,
);
