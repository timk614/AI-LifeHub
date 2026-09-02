import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Dashboard from '@/pages/dashboard';
import Market from '@/pages/market';
import Study from '@/pages/study';
import Assistant from '@/pages/assistant';
import SafeHelp from '@/pages/safehelp';
import { Favorites, History, Profile, Settings } from '@/pages/library';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

import { AppShell } from '@/components/ui-core';

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={() => <AppShell><Dashboard /></AppShell>} />
        <Route path="/market" component={() => <AppShell><Market /></AppShell>} />
        <Route path="/study" component={() => <AppShell><Study /></AppShell>} />
        <Route path="/assistant" component={() => <AppShell><Assistant /></AppShell>} />
        <Route path="/safehelp" component={() => <AppShell><SafeHelp /></AppShell>} />
        <Route path="/history" component={() => <AppShell><History /></AppShell>} />
        <Route path="/favorites" component={() => <AppShell><Favorites /></AppShell>} />
        <Route path="/settings" component={() => <AppShell><Settings /></AppShell>} />
        <Route path="/profile" component={() => <AppShell><Profile /></AppShell>} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
