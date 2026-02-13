import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/auth/login';
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';
import { ContactsPage } from './pages/app/contacts';
import { ContactDetailsPage } from './pages/app/contacts/contact-details';
import { DashboardPage } from './pages/app/dashboard';
import { ChatTestPage } from './pages/app/chat-test';
import { AttendancePage } from './pages/app/attendance';

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
            <Route path="/" element={<DashboardPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/contacts/:id" element={<ContactDetailsPage />} />
            <Route path="/atendimento" element={<AttendancePage />} />
            <Route path="/chat-test" element={<ChatTestPage />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
