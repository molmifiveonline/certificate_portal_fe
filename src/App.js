import React, { Suspense, lazy } from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { HelmetProvider } from "react-helmet-async";

// Lazy imports
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const SuperAdminDashboard = lazy(
  () => import("./pages/dashboard/SuperAdminDashboard"),
);
const TrainerDashboard = lazy(
  () => import("./pages/dashboard/TrainerDashboard"),
);
const CandidateDashboard = lazy(
  () => import("./pages/dashboard/CandidateDashboard"),
);
const CandidateList = lazy(() => import("./pages/candidates/CandidateList"));
const CreateTrainer = lazy(() => import("./pages/trainers/CreateTrainer"));
const EditTrainer = lazy(() => import("./pages/trainers/EditTrainer"));
const TrainerList = lazy(() => import("./pages/trainers/TrainerList"));
const AddCandidate = lazy(() => import("./pages/candidates/AddCandidate"));
const EditCandidate = lazy(() => import("./pages/candidates/EditCandidate"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const RolePermission = lazy(() => import("./pages/admin/RolePermission"));
const LogHistory = lazy(() => import("./pages/admin/LogHistory"));
const HotelList = lazy(() => import("./pages/hotels/HotelList"));
const CreateHotel = lazy(() => import("./pages/hotels/CreateHotel"));
const EditHotel = lazy(() => import("./pages/hotels/EditHotel"));

// Location
const LocationList = lazy(() => import("./pages/locations/LocationList"));
const CreateLocation = lazy(() => import("./pages/locations/CreateLocation"));
const EditLocation = lazy(() => import("./pages/locations/EditLocation"));

// Route Components
const PrivateRoute = lazy(() => import("./components/routes/PrivateRoute"));
const PublicRoute = lazy(() => import("./components/routes/PublicRoute"));

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                }
              />

              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* SuperAdmin / Admin Routes */}
              <Route
                path="/dashboard/super-admin"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <SuperAdminDashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/trainers"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <TrainerList />
                  </PrivateRoute>
                }
              />

              <Route
                path="/trainer/create"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <CreateTrainer />
                  </PrivateRoute>
                }
              />

              <Route
                path="/trainer/edit/:id"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <EditTrainer />
                  </PrivateRoute>
                }
              />

              <Route
                path="/candidates"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <CandidateList />
                  </PrivateRoute>
                }
              />

              <Route
                path="/candidates/add"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <AddCandidate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/candidates/edit/:id"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <EditCandidate />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/role-permissions"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <RolePermission />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/log-history"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <LogHistory />
                  </PrivateRoute>
                }
              />

              <Route
                path="/hotel-details"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <HotelList />
                  </PrivateRoute>
                }
              />

              <Route
                path="/hotel-details/create"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <CreateHotel />
                  </PrivateRoute>
                }
              />

              <Route
                path="/hotel-details/edit/:id"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <EditHotel />
                  </PrivateRoute>
                }
              />

              {/* Location Routes */}
              <Route
                path="/location"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <LocationList />
                  </PrivateRoute>
                }
              />

              <Route
                path="/location/create"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <CreateLocation />
                  </PrivateRoute>
                }
              />

              <Route
                path="/location/edit/:id"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <EditLocation />
                  </PrivateRoute>
                }
              />

              {/* Trainer Routes */}
              <Route
                path="/dashboard/trainer"
                element={
                  <PrivateRoute allowedRoles={["Trainer", "trainer"]}>
                    <TrainerDashboard />
                  </PrivateRoute>
                }
              />

              {/* Candidate Routes */}
              <Route
                path="/dashboard/candidate"
                element={
                  <PrivateRoute allowedRoles={["Candidate", "candidate"]}>
                    <CandidateDashboard />
                  </PrivateRoute>
                }
              />

              {/* Public Demo Route - kept as is, or use PublicRoute if intended for unauth */}
              <Route path="/demo" element={<SuperAdminDashboard />} />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
