import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { PasswordInput } from "../../components/ui/PasswordInput";
import locationService from "../../services/locationService";
import { getCommonFieldValidation } from "../../lib/utils/validation";

const getLocationRows = (response) => {
  if (Array.isArray(response?.data?.data?.data)) return response.data.data.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const getLocationOptionValue = (location) =>
  location?.location_name || location?.name || "";

const NominatorForm = ({
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
  submitLabel,
}) => {
  const isEditMode = Boolean(initialData?.id);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  const defaultValues = useMemo(
    () => ({
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      email: initialData?.email || "",
      mobile: initialData?.mobile || "",
      password: "",
      gender: initialData?.gender || "",
      status:
        initialData?.status === 0 || initialData?.status === "0" ? 0 : 1,
      location:
        initialData?.location ||
        initialData?.location_name ||
        initialData?.location?.location_name ||
        "",
    }),
    [initialData],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const selectedLocation = watch("location");

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    let ignore = false;

    const loadLocations = async () => {
      setLoadingLocations(true);
      try {
        const response = await locationService.getLocations({ limit: 200 });
        if (!ignore) {
          setLocations(getLocationRows(response));
        }
      } catch (_error) {
        if (!ignore) {
          setLocations([]);
        }
      } finally {
        if (!ignore) {
          setLoadingLocations(false);
        }
      }
    };

    loadLocations();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!defaultValues.location) return;
    setValue("location", defaultValues.location, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [defaultValues.location, locations, setValue]);

  const locationOptions = useMemo(() => {
    const baseOptions = [...locations];
    const hasSelectedLocation = baseOptions.some(
      (location) => getLocationOptionValue(location) === defaultValues.location,
    );

    if (!hasSelectedLocation && defaultValues.location) {
      baseOptions.unshift({
        id: `saved-${defaultValues.location}`,
        location_name: defaultValues.location,
      });
    }

    return baseOptions;
  }, [defaultValues.location, locations]);

  const emailValidation = getCommonFieldValidation({
    label: "Email",
    name: "email",
    type: "email",
    required: true,
  });

  const mobileValidation = getCommonFieldValidation({
    label: "Mobile number",
    name: "mobile",
    required: true,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Nominator Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("first_name", {
                required: "First name is required",
              })}
              className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.first_name ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
              placeholder="First Name"
            />
            {errors.first_name && (
              <span className="text-xs text-red-500 ml-1">
                {errors.first_name.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("last_name", {
                required: "Last name is required",
              })}
              className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.last_name ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
              placeholder="Last Name"
            />
            {errors.last_name && (
              <span className="text-xs text-red-500 ml-1">
                {errors.last_name.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("email", emailValidation.rules)}
              {...emailValidation.inputProps}
              className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.email ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
              placeholder="Email Address"
            />
            {errors.email && (
              <span className="text-xs text-red-500 ml-1">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register("mobile", mobileValidation.rules)}
              {...mobileValidation.inputProps}
              className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.mobile ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
              placeholder="Mobile Number"
            />
            {errors.mobile && (
              <span className="text-xs text-red-500 ml-1">
                {errors.mobile.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Password{" "}
              {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <PasswordInput
              {...register("password", {
                required: isEditMode ? false : "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be 8 to 16 characters",
                },
                maxLength: {
                  value: 16,
                  message: "Password must be 8 to 16 characters",
                },
              })}
              className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.password ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
              placeholder={
                isEditMode ? "Leave blank to keep current password" : "Password"
              }
            />
            {errors.password && (
              <span className="text-xs text-red-500 ml-1">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              {...register("gender", {
                required: "Gender is required",
              })}
              className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.gender ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
            {errors.gender && (
              <span className="text-xs text-red-500 ml-1">
                {errors.gender.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Location <span className="text-red-500">*</span>
            </label>
            <select
              {...register("location", {
                required: "Location is required",
              })}
              value={selectedLocation || ""}
              className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.location ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
              disabled={loadingLocations}
            >
              <option value="">
                {loadingLocations ? "Loading locations..." : "Select Location"}
              </option>
              {locationOptions.map((location) => (
                <option
                  key={location.id}
                  value={getLocationOptionValue(location)}
                >
                  {location.location_name}
                </option>
              ))}
            </select>
            {errors.location && (
              <span className="text-xs text-red-500 ml-1">
                {errors.location.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              {...register("status", {
                required: "Status is required",
                setValueAs: (value) => parseInt(value, 10),
              })}
              className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.status ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
            {errors.status && (
              <span className="text-xs text-red-500 ml-1">
                {errors.status.message}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 bg-white border-t border-slate-200 p-4 sm:p-6 -mb-6 flex justify-end mt-8 rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#0060AA] to-[#004E8A] hover:opacity-90 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 text-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{submitLabel}</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default NominatorForm;
