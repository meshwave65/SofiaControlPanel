import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import Home from "./pages/Home";
import Agents from "./pages/Agents";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import TaskCreate from "./pages/TaskCreate";
import Messages from "./pages/Messages";
import LegalPage from "./pages/LegalPage";
import AuthCallback from "./pages/AuthCallback";

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <DashboardLayout><Home /></DashboardLayout>;
  return user ? <DashboardLayout><Home /></DashboardLayout> : <Home />;
}

function InternalRoute({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

function Router() {
  if (window.location.pathname === "/auth/callback") {
    return <AuthCallback />;
  }

  return (
    <Switch>
      <Route path={"/"} component={HomeRoute} />
      <Route path={"/auth/callback"} component={AuthCallback} />
      <Route path={"/privacity"} component={() => <LegalPage kind="privacy" />} />
      <Route path={"/privacy"} component={() => <LegalPage kind="privacy" />} />
      <Route path={"/terms"} component={() => <LegalPage kind="terms" />} />
      <Route path={"/agents"} component={() => <InternalRoute><Agents /></InternalRoute>} />
      <Route path={"/tasks"} component={() => <InternalRoute><Tasks /></InternalRoute>} />
      <Route path={"/tasks/create"} component={() => <InternalRoute><TaskCreate /></InternalRoute>} />
      <Route path={"/tasks/:id"} component={() => <InternalRoute><TaskDetail /></InternalRoute>} />
      <Route path={"/messages"} component={() => <InternalRoute><Messages /></InternalRoute>} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
