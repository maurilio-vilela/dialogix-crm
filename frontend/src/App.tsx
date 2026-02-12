import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/auth/login';
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';
import { ContactsPage } from './pages/app/contacts';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<AppLayout />}>
            <Route path="/" element={<h1>Dashboard</h1>} />
            <Route path="/contacts" element={<ContactsPage />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;

