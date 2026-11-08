import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { FigmaShell } from './components/layout/FigmaShell';
import { FigmaPublicLanding } from './components/views/FigmaPublicLanding';
import { FigmaAuthPage } from './components/views/FigmaAuthPage';

const AppRoot: React.FC = () => {
  const { currentView, isAuthenticated } = useApp();

  // Protected route guard: unauthenticated attempts to access workspace are redirected to public landing
  if (currentView === 'workspace' && !isAuthenticated) {
    return <FigmaPublicLanding />;
  }

  if (currentView === 'auth') {
    return <FigmaAuthPage />;
  }

  if (currentView === 'workspace') {
    return <FigmaShell />;
  }

  // Default route is ALWAYS the public SecondShelf landing page
  return <FigmaPublicLanding />;
};

export default function App() {
  return (
    <AppProvider>
      <AppRoot />
    </AppProvider>
  );
}
