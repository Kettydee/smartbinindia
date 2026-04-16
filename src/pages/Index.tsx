import { AppProvider, useApp } from "@/lib/smartbin-context";
import LoginPage from "@/pages/LoginPage";
import ModeSelection from "@/pages/ModeSelection";
import Dashboard from "@/pages/Dashboard";

function AppRouter() {
  const { isLoggedIn, mode } = useApp();
  if (!isLoggedIn) return <LoginPage />;
  if (!mode) return <ModeSelection />;
  return <Dashboard />;
}

export default function Index() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
