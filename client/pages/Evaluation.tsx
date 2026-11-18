import { cn } from "../cn";
import { useEffect, useState } from "react";
import { CheckCheck, Plus, Save, Trash2 } from "lucide-react";
import { api, useData } from "../api";
import {
  Badge,
  Confirm,
  Empty,
  ErrorMessage,
  Heading,
  Loading,
  Panel,
  Stat,
  Table,
  useApp,
} from "../ui";
import type { Boundary, Exam, RosterRow, Statistics } from "../../shared/types";
import { can } from "../../shared/permissions";
import { useUnsavedChanges, confirmDiscard } from "../unsaved";
type Roster = {
  exam: Exam;
  students: RosterRow[];
  statistics: Statistics;
  boundaries: Boundary[];
};
type MarkInput = {
  studentId: string;
  marksObtained: string;
  absent: boolean;
  remarks: string;
};
export function Evaluation() {
  const { user, version } = useApp(),
    { data: exams, error, loading } = useData<Exam[]>("/exams", version),
    [selected, setSelected] = useState("");
  const available = (exams || []).filter((e) => e.status !== "CANCELLED"),
    exam =
      available.find((e) => e.id === selected) ||
      available.find((e) => (e.registered_count || 0) > 0) ||
      available[0];
  return (
    <>
      <Heading
        title={
          user.role === "FACULTY" ? "Marks & grading" : "Result publication"
        }
        description={
          user.role === "FACULTY"
            ? "Enter marks, review class statistics and prepare results for publication."
            : "Review generated grades and publish results to registered students."
        }
      />
      <ErrorMessage message={error} />
      {loading && !exams ? (
        <Loading />
      ) : !available.length ? (
        <Panel>
          <Empty title="No examinations available" />
        </Panel>
      ) : (
        <>
          <div
            className={
              "exam-selector bg-white border border-solid border-line rounded-[9px] flex items-center mb-6 px-[23px] py-5 gap-[30px] [&_>_.field]:flex-1 [&_>_.field]:max-w-135 [&_>_div_strong]:block [&_>_div_strong]:text-[22px] [&_>_div_strong]:text-[#677f54] [&_>_.badge]:ml-auto max-tablet:gap-[18px] max-tablet:[&_>_.badge]:hidden max-mobile:p-[17px] max-mobile:[&_>_div:not(.field)]:hidden max-mobile:[&_label]:w-full max-mobile:[&_select]:text-[13px]"
            }
          >
            <label
              className={
                "field flex flex-col text-[14px] min-w-0 gap-[7px] [&_>_span]:font-medium [&_>_span]:text-[#60765b] [&_b]:text-[#867555] [&_b]:font-normal [&_small]:text-[#707968] [&_small]:text-[12px] [&_small]:leading-[1.5] [&_input]:text-[14px] [&_input]:w-full [&_select]:text-[14px] [&_select]:w-full"
              }
            >
              <span>Examination</span>
              <select
                aria-label="Examination"
                value={exam?.id}
                onChange={(e) => {
                  if (confirmDiscard()) setSelected(e.target.value);
                }}
              >
                {available.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.code} · {e.exam_type} · {e.date}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className={"muted text-muted text-[14px]"}>
                Maximum marks
              </span>
              <strong>{exam?.max_marks}</strong>
            </div>
            <Badge
              value={exam?.results_published ? "PUBLISHED" : "UNPUBLISHED"}
            />
          </div>
          {exam && <EvaluationWorkspace key={exam.id} examId={exam.id} />}
        </>
      )}
    </>
  );
}
function EvaluationWorkspace({ examId }: { examId: string }) {
  const { user, version, refresh, notify } = useApp(),
    faculty = user.role === "FACULTY";
  const { data, error, loading } = useData<Roster>(
    `/marks/exam/${examId}`,
    version,
  );
  const [marks, setMarks] = useState<MarkInput[]>([]),
    [bounds, setBounds] = useState<Boundary[]>([]),
    [dirty, setDirty] = useState(false),
    [boundDirty, setBoundDirty] = useState(false),
    [message, setMessage] = useState(""),
    [saving, setBusy] = useState(false),
    [confirm, setConfirm] = useState<
      "generate" | "publish" | "withdraw" | null
    >(null);
  const busy = saving || loading;
  useUnsavedChanges(dirty || boundDirty);
  useEffect(() => {
    if (!data) return;
    if (!dirty)
      setMarks(
        data.students.map((s) => ({
          studentId: s.student_id,
          marksObtained:
            s.marks_obtained === null ? "" : String(s.marks_obtained),
          absent: !!s.absent,
          remarks: s.remarks,
        })),
      );
    if (!boundDirty)
      setBounds(
        data.boundaries.length
          ? data.boundaries.map(
              ({ grade_label, lower_bound, upper_bound }) => ({
                grade_label,
                lower_bound,
                upper_bound,
              }),
            )
          : ["F", "D", "C", "B", "A", "A+"].map((grade_label, i) => ({
              grade_label,
              lower_bound:
                [0, 0.4, 0.5, 0.6, 0.75, 0.9][i] * data.exam.max_marks,
              upper_bound:
                [0.4, 0.5, 0.6, 0.75, 0.9, 1][i] * data.exam.max_marks,
            })),
      );
    // Preserve unsaved work in the other editor when one section is saved.
  }, [data]);
  async function action(path: string, body: unknown, success: string) {
    setBusy(true);
    setMessage("");
    try {
      await api(path, "POST", body);
      if (path.startsWith("/marks/")) setDirty(false);
      if (path.startsWith("/grading/boundaries/")) setBoundDirty(false);
      refresh();
      notify(success);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (loading && !data) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;
  const locked = !!data.exam.results_published,
    ended =
      new Date(`${data.exam.date}T${data.exam.end_time}:00+05:30`).getTime() <=
      Date.now(),
    canMark = faculty && !locked && ended && data.exam.status === "PUBLISHED";
  const missing = data.students.filter(
      (s) => s.marks_obtained === null || s.absent,
    ).length,
    generated = data.students.filter(
      (s) => s.result_status === "UNPUBLISHED",
    ).length,
    stale = data.students.some(
      (s) => s.result_status === "NEEDS_RECALCULATION",
    );
  const invalidMark = (m: MarkInput, index: number) =>
    !m.absent &&
    ((m.marksObtained === "" &&
      (data.students[index]?.marks_obtained !== null ||
        m.remarks.trim() !== "")) ||
      (m.marksObtained !== "" &&
        (!Number.isFinite(Number(m.marksObtained)) ||
          Number(m.marksObtained) < 0 ||
          Number(m.marksObtained) > data.exam.max_marks)));
  const markErrors = marks.some(invalidMark);
  const setMark = (i: number, patch: Partial<MarkInput>) => {
    setMarks((rows) => rows.map((m, j) => (i === j ? { ...m, ...patch } : m)));
    setDirty(true);
  };
  return (
    <>
      <ErrorMessage message={message} />
      {locked && (
        <div
          className={
            "info-strip border border-solid border-[#d8e7e2] bg-[#edf6f2] rounded-[8px] flex items-center text-[#426955] mb-[22px] text-[14px] px-[18px] py-[14px] gap-3"
          }
        >
          <CheckCheck size={19} />
          Results are published and locked. Contact the examination office if a
          correction is required.
        </div>
      )}
      {!ended && faculty && (
        <div
          className={
            "info-strip border border-solid border-[#d8e7e2] bg-[#edf6f2] rounded-[8px] flex items-center text-[#426955] mb-[22px] text-[14px] px-[18px] py-[14px] gap-3"
          }
        >
          Marks entry opens after the scheduled examination ends.
        </div>
      )}
      <div
        className={
          "statistics-strip grid grid-cols-[repeat(6,_1fr)] border border-solid border-[#dfe8d8] bg-[#f0f6e9] rounded-[9px] mb-6 p-5 [&_>_div]:border-r [&_>_div]:border-solid [&_>_div]:border-r-[#dfe8d8] [&_>_div]:px-[18px] [&_>_div]:py-0 [&_>_div:last-child]:border-0 [&_span]:text-[12px] [&_span]:text-[#6f7a61] [&_span]:block [&_strong]:text-[23px] [&_strong]:font-semibold [&_strong]:text-[#677e52] [&_strong]:block [&_strong]:mt-1 max-tablet:grid-cols-[repeat(3,_1fr)] max-tablet:gap-[18px] max-tablet:[&_>_div:nth-child(3)]:border-0 max-mobile:grid-cols-2 max-mobile:[&_>_div]:border-0 max-mobile:px-2 max-mobile:py-[17px] max-mobile:gap-4 max-mobile:[&_>_div]:px-3 max-mobile:[&_>_div]:py-0 max-mobile:[&_strong]:text-[21px] max-mobile:[&_span]:text-[11px]"
        }
      >
        {(
          [
            ["Evaluated", data.statistics.count],
            ["Mean", data.statistics.mean],
            ["Median", data.statistics.median],
            ["Std. deviation", data.statistics.std_dev],
            ["Highest", data.statistics.highest],
            ["Lowest", data.statistics.lowest],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value ?? "—"}</strong>
          </div>
        ))}
      </div>
      <Panel
        title="Registered student roster"
        subtitle={`${data.students.length} registered · ${missing} missing marks or absent`}
        action={
          faculty && (
            <button
              className={
                "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden"
              }
              disabled={!canMark || busy || !dirty || markErrors}
              onClick={() => {
                const entries = marks
                  .filter((m) => m.absent || m.marksObtained !== "")
                  .map((m) => ({
                    studentId: m.studentId,
                    marksObtained: m.absent ? null : Number(m.marksObtained),
                    absent: m.absent,
                    remarks: m.remarks,
                  }));
                if (!entries.length) {
                  setMessage(
                    "Enter at least one mark or mark a student absent.",
                  );
                  return;
                }
                void action(
                  `/marks/exam/${examId}`,
                  { marks: entries },
                  "Marks saved and statistics updated.",
                );
              }}
            >
              <Save size={16} />
              {busy ? "Saving…" : "Save marks"}
            </button>
          )
        }
      >
        {data.students.length ? (
          <Table
            headers={[
              "Student",
              "Roll number",
              "Marks",
              ...(faculty ? ["Absent", "Remarks"] : []),
              "Grade / status",
            ]}
          >
            {data.students.map((s, i) => {
              const m = marks[i];
              if (!m) return null;
              const invalid = invalidMark(m, i);
              return (
                <tr key={s.student_id}>
                  <td>
                    <strong>{s.name}</strong>
                  </td>
                  <td>{s.roll_no}</td>
                  <td>
                    {faculty ? (
                      <>
                        <input
                          className={cn(
                            `marks-input w-[90px] text-[14px] px-[9px] py-[7px] ${invalid ? "invalid border-[#bf5148]" : ""}`,
                          )}
                          aria-label={`Marks for ${s.name}`}
                          type="number"
                          step="any"
                          min="0"
                          max={data.exam.max_marks}
                          disabled={!canMark || m.absent || busy}
                          aria-invalid={invalid}
                          value={m.marksObtained}
                          onChange={(e) =>
                            setMark(i, { marksObtained: e.target.value })
                          }
                        />
                        {invalid && (
                          <small className={"error-text text-[#b54235]"}>
                            Enter 0–{data.exam.max_marks}, or mark absent.
                          </small>
                        )}
                      </>
                    ) : (
                      (s.marks_obtained ?? "—")
                    )}
                  </td>
                  {faculty && (
                    <>
                      <td>
                        <input
                          aria-label={`${s.name} absent`}
                          type="checkbox"
                          checked={m.absent}
                          disabled={!canMark || busy}
                          onChange={(e) =>
                            setMark(i, {
                              absent: e.target.checked,
                              marksObtained: e.target.checked
                                ? ""
                                : m.marksObtained,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          className={
                            "remarks-input w-40 text-[12px] px-[9px] py-[7px]"
                          }
                          aria-label={`Remarks for ${s.name}`}
                          value={m.remarks}
                          maxLength={500}
                          disabled={!canMark || busy}
                          placeholder="Optional remark"
                          onChange={(e) =>
                            setMark(i, { remarks: e.target.value })
                          }
                        />
                      </td>
                    </>
                  )}
                  <td>
                    {s.grade && s.result_status !== "NEEDS_RECALCULATION" && (
                      <strong
                        className={
                          "grade inline-grid place-items-center bg-[#edf5e7] text-[#657f4b] rounded-[7px] min-w-[39px] h-[38px] text-[16px] font-semibold [&.fail]:bg-[#f8eeeb] [&.fail]:text-[#956f64] [&.small]:text-[14px] [&.small]:h-[25px] [&.small]:min-w-[29px] small"
                        }
                      >
                        {s.grade}
                      </strong>
                    )}
                    <small>
                      {s.result_status?.replaceAll("_", " ") || "Not generated"}
                    </small>
                  </td>
                </tr>
              );
            })}
          </Table>
        ) : (
          <Empty
            title="No registered students"
            description="Students must register before marks can be entered."
          />
        )}
        {dirty && (
          <div
            className={
              "panel-note text-[13px] bg-[#fbfcf8] text-[#707a62] leading-[1.7] px-[23px] py-[15px]"
            }
          >
            You have unsaved marks. Save before generating grades. A saved mark
            cannot be erased with a blank input; enter a corrected mark or
            accurately record absence.
          </div>
        )}
      </Panel>
      {faculty && (
        <Panel
          title="Grading boundaries"
          subtitle={`Cover 0–${data.exam.max_marks} without gaps or overlaps. F is the failing grade.`}
          action={
            <button
              className={
                "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden secondary"
              }
              disabled={!canMark || busy}
              onClick={() => {
                setBounds([
                  ...bounds,
                  {
                    grade_label: "",
                    lower_bound: 0,
                    upper_bound: data.exam.max_marks,
                  },
                ]);
                setBoundDirty(true);
              }}
            >
              <Plus size={16} />
              Add grade
            </button>
          }
        >
          <div
            className={
              "panel-note text-[13px] bg-[#fbfcf8] text-[#707a62] leading-[1.7] px-[23px] py-[15px]"
            }
          >
            Each range includes its lower bound and excludes its upper bound.
            The final range includes {data.exam.max_marks}. Exact saved marks
            are used without rounding.
          </div>
          <Table
            headers={[
              "Grade",
              "Lower bound (inclusive)",
              "Upper bound",
              "Actions",
            ]}
          >
            {bounds.map((b, i) => (
              <tr key={i}>
                <td>
                  <input
                    aria-label={`Grade label ${i + 1}`}
                    className={
                      "grade-input w-[90px] font-semibold px-[9px] py-[7px]"
                    }
                    value={b.grade_label}
                    disabled={!canMark || busy}
                    maxLength={4}
                    onChange={(e) => {
                      setBounds(
                        bounds.map((r, j) =>
                          i === j
                            ? {
                                ...r,
                                grade_label: e.target.value.toUpperCase(),
                              }
                            : r,
                        ),
                      );
                      setBoundDirty(true);
                    }}
                  />
                </td>
                <td>
                  <input
                    aria-label={`Lower bound ${i + 1}`}
                    className={
                      "marks-input w-[90px] text-[14px] px-[9px] py-[7px]"
                    }
                    type="number"
                    step="any"
                    min="0"
                    value={Number.isNaN(b.lower_bound) ? "" : b.lower_bound}
                    disabled={!canMark || busy}
                    onChange={(e) => {
                      setBounds(
                        bounds.map((r, j) =>
                          i === j
                            ? {
                                ...r,
                                lower_bound:
                                  e.target.value === ""
                                    ? NaN
                                    : Number(e.target.value),
                              }
                            : r,
                        ),
                      );
                      setBoundDirty(true);
                    }}
                  />
                </td>
                <td>
                  <input
                    aria-label={`Upper bound ${i + 1}`}
                    className={
                      "marks-input w-[90px] text-[14px] px-[9px] py-[7px]"
                    }
                    type="number"
                    step="any"
                    value={Number.isNaN(b.upper_bound) ? "" : b.upper_bound}
                    disabled={!canMark || busy}
                    onChange={(e) => {
                      setBounds(
                        bounds.map((r, j) =>
                          i === j
                            ? {
                                ...r,
                                upper_bound:
                                  e.target.value === ""
                                    ? NaN
                                    : Number(e.target.value),
                              }
                            : r,
                        ),
                      );
                      setBoundDirty(true);
                    }}
                  />
                </td>
                <td>
                  <button
                    className={
                      "icon-button border-0 bg-transparent inline-flex items-center justify-center rounded-[5px] p-[7px] [&:hover]:bg-[#eff5f1] danger text-[#b34d4d]"
                    }
                    aria-label={`Remove grade ${i + 1}`}
                    disabled={!canMark || busy}
                    onClick={() => {
                      setBounds(bounds.filter((_, j) => i !== j));
                      setBoundDirty(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </Table>
          <div
            className={
              "panel-actions flex justify-between items-center border-t border-solid border-t-line px-[23px] py-[18px] gap-4 max-mobile:flex-col max-mobile:items-end max-mobile:p-[17px] max-mobile:[&_>_.muted]:self-start"
            }
          >
            <span className={"muted text-muted text-[14px]"}>
              {boundDirty || !data.boundaries.length
                ? "Save and validate boundaries before generating grades."
                : "Boundaries saved and validated."}
            </span>
            <button
              className={
                "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden secondary"
              }
              disabled={
                !canMark || busy || (!boundDirty && data.boundaries.length > 0)
              }
              onClick={() =>
                void action(
                  `/grading/boundaries/${examId}`,
                  { boundaries: bounds },
                  "Grading boundaries validated and saved.",
                )
              }
            >
              <Save size={16} />
              Save boundaries
            </button>
          </div>
        </Panel>
      )}
      <Panel
        title="Grade preview & publication"
        subtitle="Generated grades remain private until you publish them"
      >
        <div
          className={
            "publication-summary flex items-center justify-between p-[25px] gap-5 [&_h3]:text-[16px] [&_h3]:mt-3 [&_h3]:mb-[6px] [&_h3]:text-[#5e774c] [&_h3]:mx-0 [&_p]:text-[13px] [&_p]:text-[#717963] max-wide:items-start max-wide:flex-col max-mobile:p-5"
          }
        >
          <div>
            <Badge
              value={
                locked
                  ? "PUBLISHED"
                  : stale
                    ? "NEEDS_RECALCULATION"
                    : generated
                      ? "UNPUBLISHED"
                      : "Pending"
              }
            />
            <h3>
              {locked
                ? "Results are visible to students"
                : stale
                  ? "Grades need recalculation"
                  : generated
                    ? `${generated} grades ready to publish`
                    : "Generate grades to preview results"}
            </h3>
            <p>
              {missing
                ? `${missing} students with missing marks or absence will be excluded.`
                : "All registered students have evaluated marks."}
            </p>
          </div>
          <div className={"row-actions flex items-center flex-wrap gap-[14px]"}>
            {faculty && !locked && (
              <button
                className={
                  "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden secondary"
                }
                disabled={
                  busy ||
                  dirty ||
                  boundDirty ||
                  !data.boundaries.length ||
                  !ended ||
                  data.exam.status !== "PUBLISHED" ||
                  !data.statistics.count
                }
                onClick={() => setConfirm("generate")}
              >
                Generate grades
              </button>
            )}
            {(!locked || can(user.role, "withdrawResults")) && (
              <button
                className={cn(
                  `button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden ${locked ? "secondary" : ""}`,
                )}
                disabled={
                  busy ||
                  dirty ||
                  boundDirty ||
                  (!locked && (!generated || stale))
                }
                onClick={() => setConfirm(locked ? "withdraw" : "publish")}
              >
                <CheckCheck size={17} />
                {locked ? "Withdraw publication" : "Publish results"}
              </button>
            )}
          </div>
        </div>
        <div
          className={
            "grade-preview flex flex-wrap pt-0 pb-[25px] px-[25px] gap-[15px] [&_>_div]:bg-[#f5f8ef] [&_>_div]:border [&_>_div]:border-solid [&_>_div]:border-[#e7eddd] [&_>_div]:min-w-22 [&_>_div]:rounded-[8px] [&_>_div]:text-center [&_>_div]:px-[18px] [&_>_div]:py-3 [&_span]:text-[14px] [&_span]:text-[#6c7c59] [&_strong]:text-[22px] [&_strong]:text-[#687e4c] [&_strong]:block [&_small]:text-[11px] [&_small]:text-[#727965] max-mobile:flex-wrap max-mobile:pt-0 max-mobile:pb-5 max-mobile:px-[18px] max-mobile:[&_>_div]:min-w-[75px] max-mobile:[&_>_div]:p-[10px]"
          }
        >
          {[
            ...new Set(
              data.students
                .filter(
                  (s) => s.grade && s.result_status !== "NEEDS_RECALCULATION",
                )
                .map((s) => s.grade!),
            ),
          ]
            .sort()
            .map((g) => (
              <div key={g}>
                <span>{g}</span>
                <strong>
                  {data.students.filter((s) => s.grade === g).length}
                </strong>
                <small>students</small>
              </div>
            ))}
        </div>
      </Panel>
      {confirm && (
        <Confirm
          title={
            confirm === "generate"
              ? "Generate examination grades"
              : confirm === "publish"
                ? "Publish examination results"
                : "Withdraw published results"
          }
          message={
            confirm === "generate"
              ? `Generate grades using saved marks and boundaries? ${missing ? `${missing} missing or absent students will be excluded.` : "All evaluated students will receive a draft grade."}`
              : confirm === "publish"
                ? `Publish ${generated} grades? They will become visible to the relevant students.`
                : "Students will no longer see these results until they are published again. This enables corrections."
          }
          reasonRequired={confirm === "withdraw"}
          onClose={() => setConfirm(null)}
          onConfirm={async (reason) => {
            await api(
              `/grading/${confirm}/${examId}`,
              "POST",
              confirm === "generate"
                ? { confirmMissing: true }
                : confirm === "withdraw"
                  ? { reason }
                  : {},
            );
            refresh();
            notify(
              confirm === "generate"
                ? "Draft grades generated."
                : confirm === "publish"
                  ? "Results published."
                  : "Publication withdrawn.",
            );
          }}
        />
      )}
    </>
  );
}
