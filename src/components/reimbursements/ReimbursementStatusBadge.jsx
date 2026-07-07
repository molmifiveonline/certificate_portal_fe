import React from "react";
import { Badge } from "../ui/Badge";
import {
  getReimbursementStatusLabel,
  REIMBURSEMENT_STATUS_STYLES,
} from "../../lib/utils/reimbursementUtils";

const ReimbursementStatusBadge = ({ status }) => (
  <Badge
    className={`border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-none ${
      REIMBURSEMENT_STATUS_STYLES[status] ||
      "bg-slate-100 text-slate-700 border-slate-200"
    }`}
  >
    {getReimbursementStatusLabel(status)}
  </Badge>
);

export default ReimbursementStatusBadge;

