import { Toaster } from 'sonner';

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      toastOptions={{
        style: {
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(6px)',
          color: '#e6eaf0',
        },
      }}
    />
  );
}
