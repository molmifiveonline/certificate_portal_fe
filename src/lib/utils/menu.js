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
    url: "/",
    icon: Home,
    allowedRoles: ["admin", "superadmin", "trainer", "candidate"],
  },

  // Admin Specific
  {
    title: "Candidates",
    url: "/candidates",
    icon: UserCircle,
    allowedRoles: ["admin", "superadmin"],
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
  //     { title: "All Courses", url: "/courses" },
  //     { title: "Add Course", url: "/courses/add" },
  //   ],
  // },
  {
    title: "Hotel Details",
    url: "/hotel-details",
    icon: Building,
    allowedRoles: ["admin", "superadmin"],
  },
  {
    title: "Location",
    url: "/location",
    icon: MapPin,
    allowedRoles: ["admin", "superadmin"],
  },
  // {
  //   title: "Assessment",
  //   url: "/assessment",
  //   icon: ClipboardList,
  //   allowedRoles: ["admin", "superadmin"],
  //   subItems: [
  //     { title: "All Assessments", url: "/assessment" },
  //     { title: "Create Assessment", url: "/assessment/create" },
  //   ],
  // },
  // {
  //   title: "Feedback",
  //   url: "/feedback",
  //   icon: MessageSquare,
  //   allowedRoles: ["admin", "superadmin"],
  //   subItems: [{ title: "All Feedback", url: "/feedback" }],
  // },
  // {
  //   title: "Certificates",
  //   url: "/certificates",
  //   icon: Award,
  //   allowedRoles: ["admin", "superadmin"],
  // },
  // {
  //   title: "Report",
  //   url: "/reports",
  //   icon: FileBarChart,
  //   allowedRoles: ["admin", "superadmin"],
  //   subItems: [{ title: "General Report", url: "/reports/general" }],
  // },
  {
    title: "Role Permissions",
    url: "/admin/role-permissions",
    icon: Shield,
    allowedRoles: ["admin", "superadmin"],
  },
  {
    title: "Log History",
    url: "/admin/log-history",
    icon: History,
    allowedRoles: ["admin", "superadmin"],
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
