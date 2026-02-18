import React, { Suspense, lazy } from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { HelmetProvider } from "react-helmet-async";

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

const MasterCourseList = lazy(() => import("./pages/courses/MasterCourseList"));
const MasterCourseForm = lazy(() => import("./pages/courses/MasterCourseForm"));

const ActiveCourseList = lazy(() => import("./pages/courses/ActiveCourseList"));
const ActiveCourseForm = lazy(() => import("./pages/courses/ActiveCourseForm"));

const UnifiedDashboard = lazy(
  () => import("./pages/dashboard/UnifiedDashboard"),
);

const ReportDashboard = lazy(() => import("./pages/reports/ReportDashboard"));

const LocationList = lazy(() => import("./pages/locations/LocationList"));
const CreateLocation = lazy(() => import("./pages/locations/CreateLocation"));
const EditLocation = lazy(() => import("./pages/locations/EditLocation"));

const PrivateRoute = lazy(() => import("./components/routes/PrivateRoute"));
const PublicRoute = lazy(() => import("./components/routes/PublicRoute"));

const FeedbackCategoryList = lazy(
  () => import("./pages/feedback/FeedbackCategoryList"),
);
const FeedbackQuestionList = lazy(
  () => import("./pages/feedback/FeedbackQuestionList"),
);
const SubmittedFeedbackList = lazy(
  () => import("./pages/feedback/SubmittedFeedbackList"),
);
const SubmittedFeedbackDetails = lazy(
  () => import("./pages/feedback/SubmittedFeedbackDetails"),
);
const FeedbackFormList = lazy(
  () => import("./pages/feedback/FeedbackFormList"),
);
const FeedbackFormCreate = lazy(
  () => import("./pages/feedback/FeedbackFormCreate"),
);

const QuestionBankList = lazy(
  () => import("./pages/assessment/QuestionBankList"),
);
const QuestionBankForm = lazy(
  () => import("./pages/assessment/QuestionBankForm"),
);

const AssessmentList = lazy(() => import("./pages/assessment/AssessmentList"));
const AssessmentForm = lazy(() => import("./pages/assessment/AssessmentForm"));

const SubmittedAssessmentList = lazy(
  () => import("./pages/assessment/SubmittedAssessmentList"),
);
const CourseSubmissions = lazy(
  () => import("./pages/assessment/CourseSubmissions"),
);
const SubmissionDetail = lazy(
  () => import("./pages/assessment/SubmissionDetail"),
);

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
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

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute
                    allowedRoles={[
                      "SuperAdmin",
                      "Admin",
                      "admin",
                      "Trainer",
                      "trainer",
                      "Candidate",
                      "candidate",
                    ]}
                  >
                    <UnifiedDashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/courses"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <MasterCourseList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/add"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <MasterCourseForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/edit/:id"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <MasterCourseForm />
                  </PrivateRoute>
                }
              />

              <Route
                path="/active-courses"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <ActiveCourseList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/active-courses/add"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <ActiveCourseForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/active-courses/edit/:id"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <ActiveCourseForm />
                  </PrivateRoute>
                }
              />

              <Route
                path="/dashboard/super-admin"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <UnifiedDashboard />
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
                path="/candidates/molmi"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <CandidateList registrationType="MOLMI Employee" />
                  </PrivateRoute>
                }
              />
              <Route
                path="/candidates/others"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <CandidateList registrationType="Others" />
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

              {/* Feedback Routes */}
              <Route
                path="/feedback"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <FeedbackCategoryList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/feedback/forms"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <FeedbackFormList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/feedback/forms/create"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <FeedbackFormCreate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/feedback/forms/edit/:id"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <FeedbackFormCreate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/feedback/questions"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <FeedbackQuestionList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/feedback/submitted"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <SubmittedFeedbackList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/feedback/submitted/:candidateId/:activeCourseId"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <SubmittedFeedbackDetails />
                  </PrivateRoute>
                }
              />

              {/* Assessment Routes */}
              <Route
                path="/assessment/question-bank"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <QuestionBankList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assessment/question-bank/add"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <QuestionBankForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assessment/question-bank/edit/:id"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <QuestionBankForm />
                  </PrivateRoute>
                }
              />

              {/* Assessment - Assessment List/Add/Edit Routes */}
              <Route
                path="/assessment/assessments"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <AssessmentList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assessment/assessments/add"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <AssessmentForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assessment/assessments/edit/:id"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <AssessmentForm />
                  </PrivateRoute>
                }
              />

              {/* Submitted Assessment Routes */}
              <Route
                path="/assessment/submitted"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <SubmittedAssessmentList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assessment/submitted/:courseId"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <CourseSubmissions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assessment/submission/:resultId"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <SubmissionDetail />
                  </PrivateRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <ReportDashboard />
                  </PrivateRoute>
                }
              />

              {/* Trainer Routes */}
              <Route
                path="/dashboard/trainer"
                element={
                  <PrivateRoute allowedRoles={["Trainer", "trainer"]}>
                    <UnifiedDashboard />
                  </PrivateRoute>
                }
              />

              {/* Candidate Routes */}
              <Route
                path="/dashboard/candidate"
                element={
                  <PrivateRoute allowedRoles={["Candidate", "candidate"]}>
                    <UnifiedDashboard />
                  </PrivateRoute>
                }
              />

              {/* Public Demo Route - kept as is, or use PublicRoute if intended for unauth */}
              <Route path="/demo" element={<SuperAdminDashboard />} />

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
