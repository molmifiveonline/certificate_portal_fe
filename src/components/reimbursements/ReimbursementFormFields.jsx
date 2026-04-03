import React from "react";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import {
  REIMBURSEMENT_EXPENSE_CATEGORIES,
  REIMBURSEMENT_PAYMENT_MODES,
} from "../../lib/utils/reimbursementUtils";

const fieldClassName =
  "bg-white/80 border-slate-200 focus-visible:ring-blue-500/20";

const ReimbursementFormFields = ({
  values,
  onChange,
  activeCourses = [],
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">
          Active Course
        </label>
        <Select
          value={values.active_course_id || ""}
          onValueChange={(value) => onChange("active_course_id", value)}
          disabled={disabled}
        >
          <SelectTrigger className={fieldClassName}>
            <SelectValue placeholder="Select active course" />
          </SelectTrigger>
          <SelectContent>
            {activeCourses.map((course) => (
              <SelectItem key={course.id} value={String(course.id)}>
                {course.course_name || course.topic || `Course ${course.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Claim Date</label>
        <Input
          type="date"
          value={values.claim_date || ""}
          onChange={(event) => onChange("claim_date", event.target.value)}
          disabled={disabled}
          className={fieldClassName}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">
          Expense Category
        </label>
        <Select
          value={values.expense_category || ""}
          onValueChange={(value) => onChange("expense_category", value)}
          disabled={disabled}
        >
          <SelectTrigger className={fieldClassName}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {REIMBURSEMENT_EXPENSE_CATEGORIES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Amount</label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={values.amount || ""}
          onChange={(event) => onChange("amount", event.target.value)}
          disabled={disabled}
          className={fieldClassName}
          placeholder="Enter amount"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-semibold text-slate-700">
          Expense Description
        </label>
        <Textarea
          value={values.expense_description || ""}
          onChange={(event) =>
            onChange("expense_description", event.target.value)
          }
          disabled={disabled}
          className={`${fieldClassName} min-h-[120px]`}
          placeholder="Describe the expense and why reimbursement is required"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">
          Payment Mode
        </label>
        <Select
          value={values.payment_mode || ""}
          onValueChange={(value) => onChange("payment_mode", value)}
          disabled={disabled}
        >
          <SelectTrigger className={fieldClassName}>
            <SelectValue placeholder="Select payment mode" />
          </SelectTrigger>
          <SelectContent>
            {REIMBURSEMENT_PAYMENT_MODES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">
          Account Holder Name
        </label>
        <Input
          value={values.bank_account_holder_name || ""}
          onChange={(event) =>
            onChange("bank_account_holder_name", event.target.value)
          }
          disabled={disabled}
          className={fieldClassName}
          placeholder="Enter account holder name"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Bank Name</label>
        <Input
          value={values.bank_name || ""}
          onChange={(event) => onChange("bank_name", event.target.value)}
          disabled={disabled}
          className={fieldClassName}
          placeholder="Enter bank name"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">
          Account Number
        </label>
        <Input
          value={values.account_number || ""}
          onChange={(event) => onChange("account_number", event.target.value)}
          disabled={disabled}
          className={fieldClassName}
          placeholder="Enter account number"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">IFSC Code</label>
        <Input
          value={values.ifsc_code || ""}
          onChange={(event) => onChange("ifsc_code", event.target.value)}
          disabled={disabled}
          className={fieldClassName}
          placeholder="Enter IFSC code"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-semibold text-slate-700">
          Candidate Notes
        </label>
        <Textarea
          value={values.candidate_notes || ""}
          onChange={(event) => onChange("candidate_notes", event.target.value)}
          disabled={disabled}
          className={fieldClassName}
          placeholder="Add any note for the admin team"
        />
      </div>
    </div>
  );
};

export default ReimbursementFormFields;

