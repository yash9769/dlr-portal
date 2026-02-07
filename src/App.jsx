import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
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
  )
}

export default App
