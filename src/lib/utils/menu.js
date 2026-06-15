import {
  Home,
  Users,
  UserCheck,
  FileText,
  GraduationCap,
  UserCircle,
  BookOpen,
  MapPin,
  ClipboardList,
  Building,
  FileBarChart,
  Shield,
  History,
  MessageSquare,
  Book,
  Award,
  Receipt,
} from "lucide-react";

export const MenuItems = [
  // Common / Shared
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
    allowedRoles: ["admin", "superadmin", "trainer", "candidate"],
  },
  {
    title: "Admin Roles",
    url: "/admin/admin-roles",
    icon: Shield,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "view_admin_roles",
  },
  {
    title: "Admin Users",
    url: "/admin/users",
    icon: UserCheck,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "view_admin_users",
  },
  {
    title: "Nominators",
    url: "/nominators",
    icon: Users,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "view_nominators",
  },
  // Admin Specific
  {
    title: "Candidates",
    url: "/candidates",
    icon: UserCircle,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "view_candidates",
    subItems: [
      {
        title: "MOLMI Candidates",
        url: "/candidates/molmi",
        permissionSlug: "view_candidates",
      },
      {
        title: "Other Candidates",
        url: "/candidates/others",
        permissionSlug: "view_candidates",
      },
      {
        title: "All Candidates",
        url: "/candidates/all",
        permissionSlug: "view_candidates",
      },
    ],
  },
  {
    title: "Trainers",
    url: "/trainers",
    icon: GraduationCap,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "view_trainers",
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpen,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "view_active_courses",
    permissionSlugsAny: [
      "view_master_courses",
      "view_pre_active_courses",
      "view_pre_active_approvals",
      "view_active_courses",
      "view_outhouse_courses",
    ],
    subItems: [
      {
        title: "Master Courses",
        url: "/courses",
        permissionSlug: "view_master_courses",
      },
      {
        title: "Pre-Active Courses",
        url: "/pre-active-courses",
        permissionSlug: "view_pre_active_courses",
      },
      {
        title: "Candidate Declined Requests",
        url: "/pre-active-courses/rejected-approvals",
        permissionSlug: "view_pre_active_approvals",
      },
      {
        title: "Active Courses",
        url: "/active-courses",
        permissionSlug: "view_active_courses",
      },
      {
        title: "Outhouse Courses",
        url: "/outhouse-courses",
        permissionSlug: "view_outhouse_courses",
      },
    ],
  },

  {
    title: "Hotel Details",
    url: "/hotel-details",
    icon: Building,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "view_hotels",
  },

  {
    title: "Location",
    url: "/location",
    icon: MapPin,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "view_locations",
  },
  {
    title: "Assessment",
    url: "/assessment",
    icon: ClipboardList,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "view_questions",
    subItems: [
      {
        title: "Question Bank",
        url: "/assessment/question-bank",
        permissionSlug: "view_questions",
      },
      {
        title: "Assessments",
        url: "/assessment/assessments",
        permissionSlug: "view_questions",
      },
      {
        title: "Submitted Assessments",
        url: "/assessment/submitted",
        permissionSlug: "view_questions",
      },
    ],
  },

  {
    title: "Feedback",
    url: "/feedback",
    icon: MessageSquare,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "view_feedback",
    subItems: [
      {
        title: "Feedback Category",
        url: "/feedback",
        permissionSlug: "view_feedback",
      },
      {
        title: "Feedback Question",
        url: "/feedback/forms",
        permissionSlug: "view_feedback",
      },
      {
        title: "Submitted Feedback",
        url: "/feedback/submitted",
        permissionSlug: "view_feedback",
      },
    ],
  },
  {
    title: "Certificates",
    url: "/certificates",
    icon: Award,
    allowedRoles: ["admin", "superadmin"],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileBarChart,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "view_reports",
    subItems: [
      { title: "Reports", url: "/reports", permissionSlug: "view_reports" },
      // { title: "Hotel Report", url: "/reports/hotel" },
      {
        title: "Admin Remarks",
        url: "/reports/admin-remarks",
        permissionSlug: "view_admin_remarks",
      },
    ],
  },
  {
    title: "Reimbursements",
    url: "/admin/reimbursements",
    icon: Receipt,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "manage_reimbursements",
  },
  {
    title: "System Manual",
    icon: FileText,
    url: "/system-manual",
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "view_system_manuals",
    subItems: [
      {
        title: "Manuals",
        url: "/system-manual",
        permissionSlug: "view_system_manuals",
      },
      {
        title: "Categories",
        url: "/system-manual-categories",
        permissionSlug: "view_system_manuals",
      },
    ],
  },
  {
    title: "Log History",
    url: "/admin/log-history",
    icon: History,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "view_activity_logs",
  },
  {
    title: "Role Permissions",
    url: "/admin/role-permissions",
    icon: Shield,
    allowedRoles: ["admin", "superadmin"],
    permissionSlug: "manage_permissions",
  },
  // Trainer Specific
  {
    title: "My Courses",
    url: "/my-courses",
    icon: Book,
    allowedRoles: ["trainer"],
    requiredPermission: "view_courses",
  },
  {
    title: "Assessments",
    url: "/trainer-assessments",
    icon: ClipboardList,
    allowedRoles: ["trainer"],
  },
  {
    title: "Feedback",
    url: "/trainer-feedback",
    icon: MessageSquare,
    allowedRoles: ["trainer"],
    requiredPermission: "view_feedback",
  },
  {
    title: "Certificates",
    url: "/trainer-certificates",
    icon: Award,
    allowedRoles: ["trainer"],
    requiredPermission: "view_certificates",
  },

  // Candidate Specific
  {
    title: "My Courses",
    url: "/candidate-courses",
    icon: Book,
    allowedRoles: ["candidate"],
  },
  {
    title: "My Certificates",
    url: "/candidate-certificates",
    icon: Award,
    allowedRoles: ["candidate"],
  },
  {
    title: "Reimbursements",
    url: "/reimbursements",
    icon: Receipt,
    allowedRoles: ["candidate"],
  },
];
