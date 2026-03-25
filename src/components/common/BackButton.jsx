import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "../../lib/utils/utils";

const BackButton = ({ to, className }) => {
  return (
    <Link
      to={to}
      title="Back to List"
      className={cn(
        "group flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 animate-float-subtle",
        "bg-white/95 backdrop-blur-md border border-blue-200/50 shadow-md shadow-blue-500/5",
        "hover:bg-blue-600 hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/30 hover:text-white",
        "active:scale-90",
        className,
      )}
    >
      <ArrowLeft className="w-6 h-6 text-blue-600 transition-colors duration-300 group-hover:text-white animate-arrow-shift" />
    </Link>
  );
};

export default BackButton;
