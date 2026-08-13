import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bot,
  CheckCircle2,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import { Button } from "../../components/ui/Button";
import api from "../../lib/api";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import aiQuestionService from "../../services/aiQuestionService";
import questionBankService from "../../services/questionBankService";

const TEST_TYPES = [
  { value: "1", label: "Pre Course" },
  { value: "2", label: "Post Course" },
  { value: "3", label: "Daily" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "mixed", label: "Mixed" },
];

const createDraftId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const initialFormValues = {
  master_course_id: "",
  type_of_test: [],
  topic: "",
  difficulty: "medium",
  number_of_questions: 5,
};

const buildDraft = (question) => ({
  id: createDraftId(),
  selected: true,
  question: question.question || "",
  option_a: question.option_a || "",
  option_b: question.option_b || "",
  option_c: question.option_c || "",
  option_d: question.option_d || "",
  correct_option: question.correct_option || "opt_a",
});

const AIQuestionGenerator = () => {
  const [masterCourses, setMasterCourses] = useState([]);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [formErrors, setFormErrors] = useState({});
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedCourse = useMemo(
    () =>
      masterCourses.find(
        (course) => String(course.id) === String(formValues.master_course_id),
      ),
    [formValues.master_course_id, masterCourses],
  );

  const selectedDrafts = useMemo(
    () => draftQuestions.filter((question) => question.selected),
    [draftQuestions],
  );

  useEffect(() => {
    const fetchMasterCourses = async () => {
      try {
        const response = await api.get("/master-courses");
        setMasterCourses(response.data.data || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load master courses."));
      }
    };

    fetchMasterCourses();
  }, []);

  const updateFormValue = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const updateTestType = (value, checked) => {
    setFormValues((prev) => ({
      ...prev,
      type_of_test: checked
        ? [...prev.type_of_test, value]
        : prev.type_of_test.filter((type) => type !== value),
    }));
  };

  const updateDraft = (id, name, value) => {
    setDraftQuestions((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, [name]: value } : question,
      ),
    );
  };

  const removeDraft = (id) => {
    setDraftQuestions((prev) => prev.filter((question) => question.id !== id));
  };

  const validateGenerator = () => {
    const errors = {};
    const count = Number(formValues.number_of_questions);

    if (!formValues.master_course_id) {
      errors.master_course_id = "Master Course is required";
    }
    if (formValues.type_of_test.length === 0) {
      errors.type_of_test = "Type of Test is required";
    }
    if (!formValues.topic.trim()) {
      errors.topic = "Topic is required";
    }
    if (!formValues.difficulty) {
      errors.difficulty = "Difficulty is required";
    }
    if (!Number.isInteger(count) || count < 1 || count > 20) {
      errors.number_of_questions = "Enter a number between 1 and 20";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDrafts = () => {
    if (selectedDrafts.length === 0) {
      toast.error("Select at least one question to save.");
      return false;
    }

    const invalidIndex = selectedDrafts.findIndex((question) => {
      return (
        !question.question.trim() ||
        !question.option_a.trim() ||
        !question.option_b.trim() ||
        !question.option_c.trim() ||
        !question.option_d.trim() ||
        !question.correct_option
      );
    });

    if (invalidIndex !== -1) {
      toast.error(`Question ${invalidIndex + 1} has missing details.`);
      return false;
    }

    return true;
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    if (!validateGenerator()) return;

    setIsGenerating(true);
    try {
      const response = await aiQuestionService.generateQuestions({
        ...formValues,
        master_course_name: selectedCourse?.master_course_name || "",
        number_of_questions: Number(formValues.number_of_questions),
      });

      const generatedQuestions = response.data?.questions || [];
      setDraftQuestions(generatedQuestions.map(buildDraft));

      if (response.data?.source === "placeholder") {
        toast.success("Draft questions generated with placeholder AI output.");
      } else {
        toast.success("Questions generated successfully.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to generate questions."));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSelected = async () => {
    if (!validateDrafts()) return;

    setIsSaving(true);
    try {
      await Promise.all(
        selectedDrafts.map((question) => {
          const formData = new FormData();
          formData.append("master_course_id", formValues.master_course_id);
          formData.append("type_of_test", formValues.type_of_test.join(","));
          formData.append("question", question.question.trim());
          formData.append("option_a", question.option_a.trim());
          formData.append("option_b", question.option_b.trim());
          formData.append("option_c", question.option_c.trim());
          formData.append("option_d", question.option_d.trim());
          formData.append("correct_option", question.correct_option);
          return questionBankService.createQuestion(formData);
        }),
      );

      toast.success(`${selectedDrafts.length} question(s) added successfully.`);
      setDraftQuestions([]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save selected questions."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Meta
        title="AI Question Generator"
        description="AI Question Generator"
      />

      <PageHeader
        title="AI Question Generator"
        subtitle="Create draft questions for review before adding them to the Question Bank"
        icon={Bot}
        compact={true}
        backTo="/assessment/question-bank"
      />

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-[1400px] mx-auto p-8 space-y-6">
          <form
            onSubmit={handleGenerate}
            noValidate
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 block">
                  Master Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={formValues.master_course_id}
                  onChange={(event) =>
                    updateFormValue("master_course_id", event.target.value)
                  }
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${formErrors.master_course_id ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                >
                  <option value="">Select Master Course</option>
                  {masterCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.master_course_name}
                    </option>
                  ))}
                </select>
                {formErrors.master_course_id && (
                  <span className="text-red-500 text-xs">
                    {formErrors.master_course_id}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 block">
                  Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formValues.topic}
                  onChange={(event) =>
                    updateFormValue("topic", event.target.value)
                  }
                  placeholder="Enter topic"
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${formErrors.topic ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                />
                {formErrors.topic && (
                  <span className="text-red-500 text-xs">
                    {formErrors.topic}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 block">
                    Difficulty <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formValues.difficulty}
                    onChange={(event) =>
                      updateFormValue("difficulty", event.target.value)
                    }
                    className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${formErrors.difficulty ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                  >
                    {DIFFICULTIES.map((difficulty) => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.difficulty && (
                    <span className="text-red-500 text-xs">
                      {formErrors.difficulty}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 block">
                    Questions <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formValues.number_of_questions}
                    onChange={(event) =>
                      updateFormValue(
                        "number_of_questions",
                        event.target.value,
                      )
                    }
                    className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${formErrors.number_of_questions ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                  />
                  {formErrors.number_of_questions && (
                    <span className="text-red-500 text-xs">
                      {formErrors.number_of_questions}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-slate-100 pt-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">
                  Type of Test <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {TEST_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        value={type.value}
                        checked={formValues.type_of_test.includes(type.value)}
                        onChange={(event) =>
                          updateTestType(type.value, event.target.checked)
                        }
                        className="rounded text-blue-600"
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
                {formErrors.type_of_test && (
                  <span className="text-red-500 text-xs">
                    {formErrors.type_of_test}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                disabled={isGenerating}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#0060AA] to-[#004E8A] hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 text-sm"
              >
                {isGenerating ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>
                  {isGenerating ? "Generating..." : "Generate Questions"}
                </span>
              </Button>
            </div>
          </form>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Generated Questions
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {draftQuestions.length > 0
                    ? `${selectedDrafts.length} of ${draftQuestions.length} selected`
                    : "No draft questions yet"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setDraftQuestions([])}
                  disabled={draftQuestions.length === 0 || isSaving}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm disabled:opacity-50"
                >
                  Clear
                </button>
                <Button
                  type="button"
                  onClick={handleSaveSelected}
                  disabled={draftQuestions.length === 0 || isSaving}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0060AA] to-[#004E8A] hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 text-sm"
                >
                  {isSaving ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? "Saving..." : "Add Selected"}</span>
                </Button>
              </div>
            </div>

            {draftQuestions.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-slate-500 mt-4">
                  Generated questions will appear here.
                </p>
              </div>
            ) : (
              <div className="bg-slate-50/80 p-4 sm:p-6 space-y-5">
                {draftQuestions.map((draft, index) => (
                  <section
                    key={draft.id}
                    className={`overflow-hidden rounded-xl border shadow-sm transition-all ${
                      draft.selected
                        ? "border-blue-200 bg-white ring-1 ring-blue-100"
                        : "border-slate-200 bg-white/70 opacity-75"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 px-5 py-4">
                      <div className="flex items-start gap-3">
                        <label className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={draft.selected}
                            onChange={(event) =>
                              updateDraft(
                                draft.id,
                                "selected",
                                event.target.checked,
                              )
                            }
                            className="rounded text-blue-600"
                            aria-label={`Select question ${index + 1}`}
                          />
                        </label>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-blue-600 px-2 text-xs font-bold text-white">
                              Q{index + 1}
                            </span>
                            <span className="font-semibold text-slate-900">
                              Generated Question Set
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start lg:self-center">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          Correct {draft.correct_option.replace("opt_", "").toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDraft(draft.id)}
                          className="ml-2 w-9 h-9 inline-flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                          aria-label={`Remove question ${index + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-5 space-y-5">
                      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-blue-700">
                          Question
                        </label>
                        <textarea
                          value={draft.question}
                          onChange={(event) =>
                            updateDraft(draft.id, "question", event.target.value)
                          }
                          className="w-full resize-y rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 min-h-[92px]"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-slate-800">
                            Answer Options
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {["a", "b", "c", "d"].map((option) => {
                            const field = `option_${option}`;
                            const correctValue = `opt_${option}`;
                            const isCorrect =
                              draft.correct_option === correctValue;

                            return (
                              <div
                                key={field}
                                className={`group rounded-xl border p-4 transition-all ${
                                  isCorrect
                                    ? "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-100"
                                    : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                                }`}
                              >
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                                        isCorrect
                                          ? "bg-emerald-600 text-white"
                                          : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700"
                                      }`}
                                    >
                                      {option.toUpperCase()}
                                    </span>
                                    <span
                                      className={`text-sm font-semibold ${
                                        isCorrect
                                          ? "text-emerald-800"
                                          : "text-slate-700"
                                      }`}
                                    >
                                      Option {option.toUpperCase()}
                                    </span>
                                  </div>
                                  <span
                                    className={`inline-flex items-center gap-2 text-xs font-semibold ${
                                      isCorrect
                                        ? "text-emerald-700"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`correct-${draft.id}`}
                                      value={correctValue}
                                      checked={isCorrect}
                                      onChange={(event) =>
                                        updateDraft(
                                          draft.id,
                                          "correct_option",
                                          event.target.value,
                                        )
                                      }
                                      className="text-blue-600"
                                    />
                                    {isCorrect ? "Correct answer" : "Mark correct"}
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  value={draft[field]}
                                  onChange={(event) =>
                                    updateDraft(
                                      draft.id,
                                      field,
                                      event.target.value,
                                    )
                                  }
                                  className={`w-full min-h-11 rounded-lg border px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                                    isCorrect
                                      ? "border-emerald-200 bg-white text-emerald-950"
                                      : "border-slate-200 bg-slate-50/60 text-slate-700"
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQuestionGenerator;
