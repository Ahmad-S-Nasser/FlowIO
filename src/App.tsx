import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Workflows } from './pages/Workflows';
import { Templates } from './pages/Templates';
import { Logs } from './pages/Logs';
import { Settings } from './pages/Settings';
import Integrations from './pages/Integrations';
import { Builder } from './pages/Builder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="workflows" element={<Workflows />} />
          <Route path="templates" element={<Templates />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        {/* Builder sits outside AppLayout to have full screen canvas */}
        <Route path="/builder/:id" element={<Builder />} />
        <Route path="/builder" element={<Builder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
