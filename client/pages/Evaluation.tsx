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
          <div className="exam-selector">
            <label className="field">
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
              <span className="muted">Maximum marks</span>
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
        <div className="info-strip">
          <CheckCheck size={19} />
          Results are published and locked. Contact the examination office if a
          correction is required.
        </div>
      )}
      {!ended && faculty && (
        <div className="info-strip">
          Marks entry opens after the scheduled examination ends.
        </div>
      )}
      <div className="statistics-strip">
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
              className="button"
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
                          className={`marks-input ${invalid ? "invalid" : ""}`}
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
                          <small className="error-text">
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
                          className="remarks-input"
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
                      <strong className="grade small">{s.grade}</strong>
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
          <div className="panel-note">
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
              className="button secondary"
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
          <div className="panel-note">
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
                    className="grade-input"
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
                    className="marks-input"
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
                    className="marks-input"
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
                    className="icon-button danger"
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
          <div className="panel-actions">
            <span className="muted">
              {boundDirty || !data.boundaries.length
                ? "Save and validate boundaries before generating grades."
                : "Boundaries saved and validated."}
            </span>
            <button
              className="button secondary"
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
        <div className="publication-summary">
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
          <div className="row-actions">
            {faculty && !locked && (
              <button
                className="button secondary"
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
                className={`button ${locked ? "secondary" : ""}`}
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
        <div className="grade-preview">
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
