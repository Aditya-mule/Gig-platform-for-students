import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import StudentDashboard from "@/pages/StudentDashboard";
import RecruiterDashboard from "@/pages/RecruiterDashboard";
import { useUser, UserProvider } from "./context/UserContext";

function Router() {
  const { user } = useUser();

  // Redirect to appropriate dashboard if user is logged in
  if (user) {
    if (user.role === "student" && window.location.pathname === "/") {
      window.location.href = "/student";
      return null;
    }
    if (user.role === "recruiter" && window.location.pathname === "/") {
      window.location.href = "/recruiter";
      return null;
    }
  }

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/student" component={StudentDashboard} />
      <Route path="/recruiter" component={RecruiterDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router />
        <Toaster />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
