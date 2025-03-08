
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";

// Pages
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/Project/ProjectDetails";
import SprintList from "./pages/Project/SprintList";
import ProductBacklog from "./pages/Project/ProductBacklog";
import ProjectTimeline from "./pages/Project/ProjectTimeline";
import ProjectBurndown from "./pages/Project/ProjectBurndown";
import SprintForm from "./pages/Project/SprintForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Private route wrapper
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">Loading...</p>
    </div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" /> : <Login />
      } />
      <Route path="/signup" element={
        isAuthenticated ? <Navigate to="/" /> : <Signup />
      } />
      
      {/* Private routes */}
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      
      <Route path="/projects/:projectId" element={
        <PrivateRoute>
          <ProjectDetails />
        </PrivateRoute>
      }>
        <Route index element={<SprintList />} />
        <Route path="sprints" element={<SprintList />} />
        <Route path="backlog" element={<ProductBacklog />} />
        <Route path="timeline" element={<ProjectTimeline />} />
        <Route path="burndown" element={<ProjectBurndown />} />
      </Route>
      
      <Route path="/projects/:projectId/new-sprint" element={
        <PrivateRoute>
          <SprintForm />
        </PrivateRoute>
      } />
      
      <Route path="/projects/:projectId/sprints/:sprintId/edit" element={
        <PrivateRoute>
          <SprintForm />
        </PrivateRoute>
      } />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProjectProvider>
          <Toaster />
          <Sonner position="top-right" theme="dark" />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
