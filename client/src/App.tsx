import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { fetchCurrentUser } from "./store/slices/authSlice";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BoardPage from "./pages/BoardPage";
import LoadingScreen from "./components/ui/LoadingScreen";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAppSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (!isAuthenticated) return <LoadingScreen />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  if (isAuthenticated) return <Navigate to="/board" replace />;
  return <>{children}</>;
}

export default function App() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (token) dispatch(fetchCurrentUser());
  }, [dispatch, token]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/board" replace />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/board"
        element={
          <ProtectedRoute>
            <BoardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/board" replace />} />
    </Routes>
  );
}
