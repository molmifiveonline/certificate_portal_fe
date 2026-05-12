import React, { Suspense, lazy } from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { HelmetProvider } from "react-helmet-async";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
// SuperAdminDashboard import removed - /demo route removed for security
// const TrainerDashboard = lazy(
//   () => import("./pages/dashboard/TrainerDashboard"),
// );
// const CandidateDashboard = lazy(
//   () => import("./pages/dashboard/CandidateDashboard"),
// );
const CandidateList = lazy(() => import("./pages/candidates/CandidateList"));
const CreateTrainer = lazy(() => import("./pages/trainers/CreateTrainer"));
const EditTrainer = lazy(() => import("./pages/trainers/EditTrainer"));
const TrainerList = lazy(() => import("./pages/trainers/TrainerList"));
const AddCandidate = lazy(() => import("./pages/candidates/AddCandidate"));
const EditCandidate = lazy(() => import("./pages/candidates/EditCandidate"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const RolePermission = lazy(() => import("./pages/admin/RolePermission"));
const LogHistory = lazy(() => import("./pages/admin/LogHistory"));
const AdminNotifications = lazy(
  () => import("./pages/admin/AdminNotifications"),
);
const AdminUserList = lazy(() => import("./pages/admin/users/AdminUserList"));
const CreateAdminUser = lazy(
  () => import("./pages/admin/users/CreateAdminUser"),
);
const EditAdminUser = lazy(() => import("./pages/admin/users/EditAdminUser"));
const HotelList = lazy(() => import("./pages/hotels/HotelList"));
const CreateHotel = lazy(() => import("./pages/hotels/CreateHotel"));
const EditHotel = lazy(() => import("./pages/hotels/EditHotel"));
const AdminRolesList = lazy(
  () => import("./pages/admin/admin-roles/AdminRolesList"),
);
const AdminRolesForm = lazy(
  () => import("./pages/admin/admin-roles/AdminRolesForm"),
);

const CertificateList = lazy(
  () => import("./pages/certificates/CertificateList"),
);
const CreateCertificate = lazy(
  () => import("./pages/certificates/CreateCertificate"),
);
const EditCertificate = lazy(
  () => import("./pages/certificates/EditCertificate"),
);
const CertificatePrintView = lazy(
  () => import("./pages/certificates/CertificatePrintView"),
);
const CertificateVerification = lazy(
  () => import("./pages/certificates/CertificateVerification"),
);

const MasterCourseList = lazy(() => import("./pages/courses/MasterCourseList"));
const MasterCourseForm = lazy(() => import("./pages/courses/MasterCourseForm"));

const ActiveCourseList = lazy(() => import("./pages/courses/ActiveCourseList"));
const ActiveCourseForm = lazy(() => import("./pages/courses/ActiveCourseForm"));
const OuthouseCourseList = lazy(
  () => import("./pages/outhouse-courses/OuthouseCourseList"),
);
const OuthouseCourseForm = lazy(
  () => import("./pages/outhouse-courses/OuthouseCourseForm"),
);

const PreActiveCourseList = lazy(
  () => import("./pages/pre-active-courses/PreActiveCourseList"),
);
const PreActiveCourseForm = lazy(
  () => import("./pages/pre-active-courses/PreActiveCourseForm"),
);
const AdminPreActiveApprovals = lazy(
  () => import("./pages/pre-active-courses/AdminPreActiveApprovals"),
);
const RejectedCandidateApprovals = lazy(
  () => import("./pages/pre-active-courses/RejectedCandidateApprovals"),
);
const NominatorPortal = lazy(
  () => import("./pages/pre-active-courses/NominatorPortal"),
);
const CandidateApprovalPortal = lazy(
  () => import("./pages/pre-active-courses/CandidateApprovalPortal"),
);

const Acknowledge = lazy(() => import("./pages/Acknowledge"));

const UnifiedDashboard = lazy(
  () => import("./pages/dashboard/UnifiedDashboard"),
);

const ReportDashboard = lazy(() => import("./pages/reports/ReportDashboard"));
const HotelReport = lazy(() => import("./pages/reports/HotelReport"));
const AdminRemarksReport = lazy(
  () => import("./pages/reports/AdminRemarksReport"),
);

const LocationList = lazy(() => import("./pages/locations/LocationList"));
const CreateLocation = lazy(() => import("./pages/locations/CreateLocation"));
const EditLocation = lazy(() => import("./pages/locations/EditLocation"));

const SystemManualList = lazy(
  () => import("./pages/system-manual/SystemManualList"),
);
const CreateSystemManual = lazy(
  () => import("./pages/system-manual/CreateSystemManual"),
);
const EditSystemManual = lazy(
  () => import("./pages/system-manual/EditSystemManual"),
);

const NominatorList = lazy(() => import("./pages/nominators/NominatorList"));
const CreateNominator = lazy(
  () => import("./pages/nominators/CreateNominator"),
);
const EditNominator = lazy(() => import("./pages/nominators/EditNominator"));

const PrivateRoute = lazy(() => import("./components/routes/PrivateRoute"));
const PublicRoute = lazy(() => import("./components/routes/PublicRoute"));

const FeedbackCategoryList = lazy(
  () => import("./pages/feedback/FeedbackCategoryList"),
);
const FeedbackQuestionList = lazy(
  () => import("./pages/feedback/FeedbackQuestionList"),
);
// Remove SubmittedFeedbackList import as it is obsolete now
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
// const AssessmentSubmissionList = lazy(
//   () => import("./pages/assessment/AssessmentSubmissionList"),
// );
const SubmissionDetail = lazy(
  () => import("./pages/assessment/SubmissionDetail"),
);

const TrainerCertificateList = lazy(
  () => import("./pages/trainers/TrainerCertificateList"),
);
const TrainerCourseList = lazy(
  () => import("./pages/trainers/TrainerCourseList"),
);

const FeedbackCourseList = lazy(
  () => import("./pages/feedback/FeedbackCourseList"),
);

const FeedbackCandidateList = lazy(
  () => import("./pages/feedback/FeedbackCandidateList"),
);

const CandidateCourseList = lazy(
  () => import("./pages/candidates/CandidateCourseList"),
);

const CandidateCertificateList = lazy(
  () => import("./pages/candidates/CandidateCertificateList"),
);

const CandidateCourseDetails = lazy(
  () => import("./pages/candidates/CandidateCourseDetails"),
);
const ReimbursementList = lazy(
  () => import("./pages/reimbursements/ReimbursementList"),
);
const ReimbursementForm = lazy(
  () => import("./pages/reimbursements/ReimbursementForm"),
);
const ReimbursementDetails = lazy(
  () => import("./pages/reimbursements/ReimbursementDetails"),
);
const ReimbursementAdminList = lazy(
  () => import("./pages/admin/reimbursements/ReimbursementAdminList"),
);
const ReimbursementAdminDetails = lazy(
  () => import("./pages/admin/reimbursements/ReimbursementAdminDetails"),
);

const ADMIN_ROLES = ["SuperAdmin", "Admin", "admin"];
const TRAINER_ROLES = ["Trainer", "trainer"];
const CANDIDATE_ROLES = ["Candidate", "candidate"];
const ALL_APP_ROLES = [...ADMIN_ROLES, ...TRAINER_ROLES, ...CANDIDATE_ROLES];
const COURSE_ROUTE_PERMISSIONS = [
  "view_master_courses",
  "view_pre_active_courses",
  "view_active_courses",
  "view_outhouse_courses",
];

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
              <Route
                path="/authenticity-verification/:id"
                element={<CertificateVerification />}
              />

              <Route path="/nominate/:token" element={<NominatorPortal />} />
              <Route
                path="/candidate-approval/:token"
                element={<CandidateApprovalPortal />}
              />

              <Route
                path="/acknowledge"
                element={<Acknowledge />}
              />

              <Route path="/" element={<Navigate to="/login" replace />} />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute
                    allowedRoles={ALL_APP_ROLES}
                    allowRestrictedAdminWithoutPermissions={true}
                  >
                    <UnifiedDashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/courses"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredAnyPermissions={COURSE_ROUTE_PERMISSIONS}
                  >
                    <MasterCourseList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/add"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredAnyPermissions={COURSE_ROUTE_PERMISSIONS}
                  >
                    <MasterCourseForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/edit/:id"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredAnyPermissions={COURSE_ROUTE_PERMISSIONS}
                  >
                    <MasterCourseForm />
                  </PrivateRoute>
                }
              />

              <Route
                path="/active-courses"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredAnyPermissions={COURSE_ROUTE_PERMISSIONS}
                  >
                    <ActiveCourseList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/active-courses/add"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredAnyPermissions={COURSE_ROUTE_PERMISSIONS}
                  >
                    <ActiveCourseForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/active-courses/edit/:id"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredAnyPermissions={COURSE_ROUTE_PERMISSIONS}
                  >
                    <ActiveCourseForm />
                  </PrivateRoute>
                }
              />

              <Route
                path="/outhouse-courses"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredAnyPermissions={COURSE_ROUTE_PERMISSIONS}
                  >
                    <OuthouseCourseList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/outhouse-courses/add"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredAnyPermissions={COURSE_ROUTE_PERMISSIONS}
                  >
                    <OuthouseCourseForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/outhouse-courses/edit/:id"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredAnyPermissions={COURSE_ROUTE_PERMISSIONS}
                  >
                    <OuthouseCourseForm />
                  </PrivateRoute>
                }
              />

              <Route
                path="/pre-active-courses"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredAnyPermissions={COURSE_ROUTE_PERMISSIONS}
                  >
                    <PreActiveCourseList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/pre-active-courses/add"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredAnyPermissions={COURSE_ROUTE_PERMISSIONS}
                  >
                    <PreActiveCourseForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/pre-active-courses/edit/:id"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredAnyPermissions={COURSE_ROUTE_PERMISSIONS}
                  >
                    <PreActiveCourseForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/pre-active-courses/rejected-approvals"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="view_pre_active_approvals"
                  >
                    <RejectedCandidateApprovals />
                  </PrivateRoute>
                }
              />
              <Route
                path="/pre-active-courses/:id/approvals"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="view_pre_active_approvals"
                  >
                    <AdminPreActiveApprovals />
                  </PrivateRoute>
                }
              />

              <Route
                path="/dashboard/super-admin"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    allowRestrictedAdminWithoutPermissions={true}
                  >
                    <UnifiedDashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/trainers"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="view_trainers"
                  >
                    <TrainerList />
                  </PrivateRoute>
                }
              />

              <Route
                path="/trainer/create"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="create_trainer"
                  >
                    <CreateTrainer />
                  </PrivateRoute>
                }
              />

              <Route
                path="/trainer/edit/:id"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="edit_trainer"
                  >
                    <EditTrainer />
                  </PrivateRoute>
                }
              />

              <Route
                path="/candidates/molmi"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="view_candidates"
                  >
                    <CandidateList key="molmi" registrationType="MOLMI Employee" />
                  </PrivateRoute>
                }
              />
              <Route
                path="/candidates/others"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="view_candidates"
                  >
                    <CandidateList key="others" registrationType="Others" />
                  </PrivateRoute>
                }
              />

              <Route
                path="/candidates/add"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="create_candidate"
                  >
                    <AddCandidate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/candidates/edit/:id"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="edit_candidate"
                  >
                    <EditCandidate />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/role-permissions"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="manage_permissions"
                  >
                    <RolePermission />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/log-history"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="view_logs"
                  >
                    <LogHistory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/reimbursements"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <ReimbursementAdminList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/reimbursements/:id"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <ReimbursementAdminDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <AdminNotifications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="manage_admin_users"
                  >
                    <AdminUserList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/admin-roles"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="manage_admin_roles"
                  >
                    <AdminRolesList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/admin-roles/create"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="create_admin_role"
                  >
                    <AdminRolesForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/admin-roles/edit/:id"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="edit_admin_role"
                  >
                    <AdminRolesForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users/create"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="create_admin_user"
                  >
                    <CreateAdminUser />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users/edit/:id"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="edit_admin_user"
                  >
                    <EditAdminUser />
                  </PrivateRoute>
                }
              />

              <Route
                path="/hotel-details"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="view_hotels"
                  >
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

              <Route
                path="/system-manual"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <SystemManualList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/system-manual/create"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <CreateSystemManual />
                  </PrivateRoute>
                }
              />
              <Route
                path="/system-manual/edit/:id"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <EditSystemManual />
                  </PrivateRoute>
                }
              />

              {/* Location Routes */}
              <Route
                path="/location"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="view_locations"
                  >
                    <LocationList />
                  </PrivateRoute>
                }
              />

              <Route
                path="/location/create"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="create_location"
                  >
                    <CreateLocation />
                  </PrivateRoute>
                }
              />

              <Route
                path="/location/edit/:id"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="edit_location"
                  >
                    <EditLocation />
                  </PrivateRoute>
                }
              />

              {/* Kevin - Nominator Routes */}
              <Route
                path="/nominators"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="view_nominators"
                  >
                    <NominatorList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/nominators/add"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="create_nominator"
                  >
                    <CreateNominator />
                  </PrivateRoute>
                }
              />
              <Route
                path="/nominators/edit/:id"
                element={
                  <PrivateRoute
                    allowedRoles={ADMIN_ROLES}
                    requiredPermission="edit_nominator"
                  >
                    <EditNominator />
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
                    <FeedbackCourseList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/feedback/submitted/candidates/:activeCourseId"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <FeedbackCandidateList />
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
                path="/certificates"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <CertificateList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/certificates/create"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <CreateCertificate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/certificates/edit/:id"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <EditCertificate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/certificates/print/:id"
                element={
                  <PrivateRoute
                    allowedRoles={[
                      "SuperAdmin",
                      "Admin",
                      "admin",
                      "Candidate",
                      "candidate",
                    ]}
                    noLayout={true}
                  >
                    <CertificatePrintView />
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
              <Route
                path="/reports/hotel"
                element={
                  <PrivateRoute allowedRoles={["SuperAdmin", "Admin", "admin"]}>
                    <HotelReport />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports/admin-remarks"
                element={
                  <PrivateRoute
                    allowedRoles={["SuperAdmin", "Admin", "admin"]}
                    requiredPermission="view_admin_remarks"
                  >
                    <AdminRemarksReport />
                  </PrivateRoute>
                }
              />

              {/* Trainer Routes */}
              <Route
                path="/dashboard/trainer"
                element={
                  <PrivateRoute allowedRoles={TRAINER_ROLES}>
                    <UnifiedDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/candidate"
                element={
                  <PrivateRoute allowedRoles={CANDIDATE_ROLES}>
                    <UnifiedDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/trainer-certificates"
                element={
                  <PrivateRoute allowedRoles={TRAINER_ROLES}>
                    <TrainerCertificateList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-courses"
                element={
                  <PrivateRoute allowedRoles={TRAINER_ROLES}>
                    <TrainerCourseList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-courses/edit/:id"
                element={
                  <PrivateRoute allowedRoles={TRAINER_ROLES}>
                    <ActiveCourseForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/trainer-feedback"
                element={
                  <PrivateRoute allowedRoles={["Trainer", "trainer"]}>
                    <FeedbackCourseList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/trainer-feedback/candidates/:activeCourseId"
                element={
                  <PrivateRoute allowedRoles={["Trainer", "trainer"]}>
                    <FeedbackCandidateList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/trainer-feedback/submitted/:candidateId/:activeCourseId"
                element={
                  <PrivateRoute allowedRoles={["Trainer", "trainer"]}>
                    <SubmittedFeedbackDetails />
                  </PrivateRoute>
                }
              />

              <Route
                path="/trainer-assessments"
                element={
                  <PrivateRoute allowedRoles={["Trainer", "trainer"]}>
                    <AssessmentList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/trainer-assessments/add"
                element={
                  <PrivateRoute allowedRoles={["Trainer", "trainer"]}>
                    <AssessmentForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/trainer-assessments/edit/:id"
                element={
                  <PrivateRoute allowedRoles={["Trainer", "trainer"]}>
                    <AssessmentForm />
                  </PrivateRoute>
                }
              />

              <Route
                path="/candidate-courses"
                element={
                  <PrivateRoute allowedRoles={CANDIDATE_ROLES}>
                    <CandidateCourseList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/candidate-course/:id"
                element={
                  <PrivateRoute allowedRoles={CANDIDATE_ROLES}>
                    <CandidateCourseDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/candidate-certificates"
                element={
                  <PrivateRoute allowedRoles={CANDIDATE_ROLES}>
                    <CandidateCertificateList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reimbursements"
                element={
                  <PrivateRoute allowedRoles={CANDIDATE_ROLES}>
                    <ReimbursementList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reimbursements/create"
                element={
                  <PrivateRoute allowedRoles={CANDIDATE_ROLES}>
                    <ReimbursementForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reimbursements/:id"
                element={
                  <PrivateRoute allowedRoles={CANDIDATE_ROLES}>
                    <ReimbursementDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reimbursements/:id/edit"
                element={
                  <PrivateRoute allowedRoles={CANDIDATE_ROLES}>
                    <ReimbursementForm />
                  </PrivateRoute>
                }
              />

              {/* Demo route removed - all pages require authentication */}

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
