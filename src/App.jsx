import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';

function App() {
  console.log('App component rendering');
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster
            position="top-right"
            containerStyle={{
              top: 40,
              left: 20,
              bottom: 20,
              right: 20,
            }}
            toastOptions={{
              className: 'font-sans font-bold text-sm',
              style: {
                borderRadius: '12px',
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
