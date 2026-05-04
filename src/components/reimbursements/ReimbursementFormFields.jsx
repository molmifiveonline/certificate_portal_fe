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
import { cn } from "../../lib/utils/utils";

const fieldClassName =
  "bg-white/80 border-slate-200 focus-visible:ring-blue-500/20";
const errorFieldClassName =
  "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20";

const requiredFields = new Set([
  "active_course_id",
  "claim_date",
  "expense_category",
  "amount",
  "expense_description",
]);

const FieldLabel = ({ children, name }) => (
  <label className="text-sm font-semibold text-slate-700">
    {children}{" "}
    {requiredFields.has(name) && <span className="text-red-500">*</span>}
  </label>
);

const FieldError = ({ message }) =>
  message ? (
    <p className="text-xs font-medium text-red-500">{message}</p>
  ) : null;

const ReimbursementFormFields = ({
  values,
  errors = {},
  onChange,
  activeCourses = [],
  disabled = false,
}) => {
  const getFieldClassName = (name, extraClassName) =>
    cn(fieldClassName, errors[name] && errorFieldClassName, extraClassName);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="space-y-2">
        <FieldLabel name="active_course_id">Active Course</FieldLabel>
        <Select
          value={values.active_course_id || ""}
          onValueChange={(value) => onChange("active_course_id", value)}
          disabled={disabled}
        >
          <SelectTrigger className={getFieldClassName("active_course_id")}>
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
        <FieldError message={errors.active_course_id} />
      </div>

      <div className="space-y-2">
        <FieldLabel name="claim_date">Claim Date</FieldLabel>
        <Input
          type="date"
          value={values.claim_date || ""}
          onChange={(event) => onChange("claim_date", event.target.value)}
          disabled={disabled}
          className={getFieldClassName("claim_date")}
        />
        <FieldError message={errors.claim_date} />
      </div>

      <div className="space-y-2">
        <FieldLabel name="expense_category">Expense Category</FieldLabel>
        <Select
          value={values.expense_category || ""}
          onValueChange={(value) => onChange("expense_category", value)}
          disabled={disabled}
        >
          <SelectTrigger className={getFieldClassName("expense_category")}>
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
        <FieldError message={errors.expense_category} />
      </div>

      <div className="space-y-2">
        <FieldLabel name="amount">Amount</FieldLabel>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={values.amount || ""}
          onChange={(event) => onChange("amount", event.target.value)}
          disabled={disabled}
          className={getFieldClassName("amount")}
          placeholder="Enter amount"
        />
        <FieldError message={errors.amount} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <FieldLabel name="expense_description">Expense Description</FieldLabel>
        <Textarea
          value={values.expense_description || ""}
          onChange={(event) =>
            onChange("expense_description", event.target.value)
          }
          disabled={disabled}
          className={getFieldClassName("expense_description", "min-h-[120px]")}
          placeholder="Describe the expense and why reimbursement is required"
        />
        <FieldError message={errors.expense_description} />
      </div>

      <div className="space-y-2">
        <FieldLabel name="payment_mode">Payment Mode</FieldLabel>
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
        <FieldLabel name="bank_account_holder_name">
          Account Holder Name
        </FieldLabel>
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
        <FieldLabel name="bank_name">Bank Name</FieldLabel>
        <Input
          value={values.bank_name || ""}
          onChange={(event) => onChange("bank_name", event.target.value)}
          disabled={disabled}
          className={fieldClassName}
          placeholder="Enter bank name"
        />
      </div>

      <div className="space-y-2">
        <FieldLabel name="account_number">Account Number</FieldLabel>
        <Input
          value={values.account_number || ""}
          onChange={(event) => onChange("account_number", event.target.value)}
          disabled={disabled}
          className={fieldClassName}
          placeholder="Enter account number"
        />
      </div>

      <div className="space-y-2">
        <FieldLabel name="ifsc_code">IFSC Code</FieldLabel>
        <Input
          value={values.ifsc_code || ""}
          onChange={(event) => onChange("ifsc_code", event.target.value)}
          disabled={disabled}
          className={fieldClassName}
          placeholder="Enter IFSC code"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <FieldLabel name="candidate_notes">Candidate Notes</FieldLabel>
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
