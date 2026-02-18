import {
  Home,
  Users,
  UserCheck,
  Calendar,
  CalendarDays,
  FileText,
  Receipt,
  Activity,
  FolderKanban,
  GraduationCap,
  UserCircle,
  BookOpen,
  MapPin,
  ClipboardList,
  MessageSquare,
  Award,
  Book,
  FileBadge,
  ChevronDown,
  ChevronRight,
  School,
  Building,
  ClipboardCheck,
  FileBarChart,
  Shield,
  History,
} from "lucide-react";

export const MenuItems = [
  // Common / Shared
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
    allowedRoles: ["admin", "superadmin", "trainer", "candidate"],
  },

  // Admin Specific
  {
    title: "Candidates",
    url: "/candidates",
    icon: UserCircle,
    allowedRoles: ["admin", "superadmin"],
    subItems: [
      { title: "MOLMI Candidates", url: "/candidates/molmi" },
      { title: "Other Candidates", url: "/candidates/others" },
    ],
  },
  {
    title: "Trainers",
    url: "/trainers",
    icon: GraduationCap,
    allowedRoles: ["admin", "superadmin"],
  },
  // {
  //   title: "Courses",
  //   url: "/courses",
  //   icon: BookOpen,
  //   allowedRoles: ["admin", "superadmin"],
  //   subItems: [
  //     { title: "Master Courses", url: "/courses" },
  //     { title: "Active Courses", url: "/active-courses" },
  //   ],
  // },
  // {
  //   title: "Hotel Details",
  //   url: "/hotel-details",
  //   icon: Building,
  //   allowedRoles: ["admin", "superadmin"],
  // },
  // {
  //   title: "Location",
  //   url: "/location",
  //   icon: MapPin,
  //   allowedRoles: ["admin", "superadmin"],
  // },
  // {
  //   title: "Assessment",
  //   url: "/assessment",
  //   icon: ClipboardList,
  //   allowedRoles: ["admin", "superadmin"],
  //   subItems: [
  //     { title: "Question Bank", url: "/assessment/question-bank" },
  //     { title: "Assessments", url: "/assessment/assessments" },
  //     { title: "Submitted Assessments", url: "/assessment/submitted" },
  //   ],
  // },

  // {
  //   title: "Feedback",
  //   url: "/feedback",
  //   icon: MessageSquare,
  //   allowedRoles: ["admin", "superadmin"],
  //   subItems: [
  //     { title: "Feedback Category", url: "/feedback" },
  //     { title: "Feedback Question", url: "/feedback/forms" },
  //     { title: "Submitted Feedback", url: "/feedback/submitted" },
  //   ],
  // },
  // {
  //   title: "Certificates",
  //   url: "/certificates",
  //   icon: Award,
  //   allowedRoles: ["admin", "superadmin"],
  // },
  {
    title: "Reports",
    url: "/reports",
    icon: FileBarChart,
    allowedRoles: ["admin", "superadmin"],
  },
  // {
  //   title: "Role Permissions",
  //   url: "/admin/role-permissions",
  //   icon: Shield,
  //   allowedRoles: ["admin", "superadmin"],
  // },
  // {
  //   title: "Log History",
  //   url: "/admin/log-history",
  //   icon: History,
  //   allowedRoles: ["admin", "superadmin"],
  // },

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
    icon: Users,
    allowedRoles: ["trainer"],
    requiredPermission: "view_assessments",
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
    icon: Book,
    allowedRoles: ["trainer"],
    requiredPermission: "view_certificates",
  },

  // Candidate Specific
  {
    title: "My Courses",
    url: "/candidate-courses",
    icon: Book,
    allowedRoles: ["candidate"],
    requiredPermission: "view_courses",
  },
  {
    title: "My Certificates",
    url: "/candidate-certificates",
    icon: Award,
    allowedRoles: ["candidate"],
    requiredPermission: "view_certificates",
  },
];
