// ==========================================
// Roles & Permissions
// ==========================================
export const ADMIN_ROLES = ["SuperAdmin", "Admin", "admin"];
export const TRAINER_ROLES = ["Trainer", "trainer"];
export const CANDIDATE_ROLES = ["Candidate", "candidate"];
export const ALL_APP_ROLES = [...ADMIN_ROLES, ...TRAINER_ROLES, ...CANDIDATE_ROLES];

export const COURSE_ROUTE_PERMISSIONS = [
  "view_master_courses",
  "view_pre_active_courses",
  "view_active_courses",
  "view_outhouse_courses",
];

// ==========================================
// Course Statuses & Options
// ==========================================
export const OUTHOUSE_COURSE_STATUSES = [
  "Initiated",
  "Course Started",
  "Course Completed",
  "Certificate Generated",
];

export const OUTHOUSE_COURSE_STATUS_STYLES = {
  Initiated: "bg-blue-50 text-blue-700 border-blue-100",
  "Course Started": "bg-orange-50 text-orange-700 border-orange-100",
  "Course Completed": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Certificate Generated": "bg-green-50 text-green-700 border-green-100",
};

export const LOCATION_TYPES = ["Online", "Offline", "Hybrid", "Manual"];
export const FEEDBACK_TYPES = ["Document", "Manual"];
export const COURSE_LEVELS = ["Operational", "Management", "Support", "Advanced"];
export const COURSE_TYPES = [
  "Out house",
  "External Certification",
  "Third Party",
  "Refresher",
];

export const STATUS_POOL_OPTIONS = [
  "Selected",
  "Confirmed",
  "Standby",
  "Waitlisted",
  "Completed",
];

export const FEEDBACK_COURSE_MODE_OPTIONS = ["Online", "Offline"];

export const CANDIDATE_REJECTION_REASONS = [
  { value: "Other", label: "Other" },
  { value: "Not Available", label: "Not Available" },
];

export const ADMIN_STATUS_OPTIONS = [
  { value: "", label: "All admin statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

export const TRAINER_COURSE_STATUSES = [
  "",
  "Initiated",
  "Course Started",
  "Assessment Initiated",
  "Feedback Generated",
  "Certificate Generated",
  "Course Completed",
  "Cancelled",
];

// ==========================================
// Candidate Management
// ==========================================
export const CANDIDATE_USER_FIELDS = ["first_name", "last_name", "email", "mobile", "status"];

export const CANDIDATE_PROFILE_FIELDS = [
  "middle_name",
  "prefix",
  "gender",
  "dob",
  "nationality",
  "passport_no",
  "employee_id",
  "manager",
  "rank",
  "whatsapp_number",
  "alternate_mobile",
  "indos_number",
  "registration_type",
  "designation",
  "vessel_type",
  "last_vessel_name",
  "next_vessel_name",
  "manning_company",
  "sign_on_date",
  "sign_off_date",
  "officer",
  "seaman_book_no",
  "profile_image",
];

export const CANDIDATE_FIELD_LABELS = {
  first_name: "First Name",
  last_name: "Last Name",
  email: "Email Address",
  mobile: "Mobile Number",
  status: "Status",
  middle_name: "Middle Name",
  prefix: "Prefix / Title",
  gender: "Gender",
  dob: "Date of Birth",
  nationality: "Nationality",
  passport_no: "Passport Number",
  employee_id: "Employee ID",
  manager: "Manager",
  rank: "Rank",
  whatsapp_number: "WhatsApp Number",
  alternate_mobile: "Alternate Mobile",
  indos_number: "INDOS Number",
  registration_type: "Registration Type",
  designation: "Designation",
  vessel_type: "Vessel Type",
  last_vessel_name: "Last Vessel Name",
  next_vessel_name: "Next Vessel Name",
  manning_company: "Manning Company",
  sign_on_date: "Sign On Date",
  sign_off_date: "Sign Off Date",
  officer: "Officer Type",
  seaman_book_no: "Seaman Book No",
  profile_image: "Profile Image Link",
};

export const CANDIDATE_SYNC_HISTORY_DAYS = 60;
export const CANDIDATE_LAST_SYNC_STORAGE_KEY = "candidate.lastSyncedDate";

// ==========================================
// Utilities & Reports
// ==========================================
export const DEFAULT_VALIDATION_LABEL = "This field";

export const REPORT_MONTH_OPTIONS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];
