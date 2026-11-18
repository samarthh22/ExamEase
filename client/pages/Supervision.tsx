import { useState } from "react";
import { Plus, Printer } from "lucide-react";
import { api, useData } from "../api";
import {
  Badge,
  Confirm,
  Empty,
  ErrorMessage,
  Heading,
  Loading,
  Modal,
  Panel,
  RecordForm,
  SearchBox,
  Table,
  dateLabel,
  useApp,
} from "../ui";
import type {
  DutyStaff,
  Exam,
  ExamDuty,
  HallStudent,
} from "../../shared/types";
type HallRoster = {
  exam: Pick<
    Exam,
    | "id"
    | "code"
    | "title"
    | "exam_type"
    | "date"
    | "start_time"
    | "end_time"
    | "venue"
    | "status"
  >;
  students: HallStudent[];
};
const upcoming = (exam: Pick<Exam, "date" | "start_time">) =>
  new Date(`${exam.date}T${exam.start_time}:00+05:30`).getTime() > Date.now();
export function Supervision() {
  const { user, version, refresh, notify } = useApp(),
    admin = user.role === "EXAM_ADMIN";
  const duties = useData<ExamDuty[]>("/duties", version),
    staff = useData<DutyStaff[]>(admin ? "/duties/staff" : "", version),
    exams = useData<Exam[]>(admin ? "/exams" : "", version);
  const [adding, setAdding] = useState<string | null>(null),
    [removing, setRemoving] = useState<ExamDuty | null>(null),
    [rosterId, setRosterId] = useState(""),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("ASSIGNED");
  const roster = useData<HallRoster>(
    rosterId ? `/duties/exam/${rosterId}/roster` : "",
    version,
  );
  const editable = (exams.data || []).filter(
    (e) => e.status !== "CANCELLED" && upcoming(e),
  );
  const rows = (duties.data || []).filter(
    (d) =>
      (!status || d.status === status) &&
      `${d.code} ${d.title} ${d.name} ${d.venue}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <Heading
        title={
          admin ? "Examination hall staffing" : "My examination hall duties"
        }
        description={
          admin
            ? "Assign faculty invigilators and teaching assistants to examination halls."
            : "Review your assigned examinations, venue and registered student roster."
        }
        action={
          admin && (
            <button
              className="button inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-white disabled:opacity-50"
              disabled={!editable.length || !staff.data?.length}
              onClick={() => setAdding("")}
            >
              <Plus size={17} />
              Assign duty
            </button>
          )
        }
      />
      <div className="info-strip mb-6 rounded-lg border border-line bg-emerald-50 px-5 py-4 text-sm text-brand-dark">
        {admin
          ? "Invigilators are existing faculty members. Teaching assistants support hall supervision. A hall duty does not grant marks-entry, grading or account-management permissions."
          : "Your hall roster contains names, roll numbers and seat numbers only. Contact the examination office for duty changes; marks and grading remain with the assigned course faculty."}
      </div>
      <ErrorMessage message={duties.error || staff.error || exams.error} />
      {admin && (
        <Panel
          title="Upcoming examination coverage"
          subtitle="Published exams without a faculty invigilator need staffing. Draft duties are visible to the office only."
        >
          {exams.loading || duties.loading ? (
            <Loading />
          ) : editable.length ? (
            <Table
              headers={[
                "Examination",
                "Hall / time (IST)",
                "Faculty invigilators",
                "Teaching assistants",
                "Actions",
              ]}
            >
              {editable.map((exam) => {
                const assigned = (duties.data || []).filter(
                    (d) =>
                      d.exam_id === exam.id &&
                      d.status === "ASSIGNED" &&
                      d.account_active &&
                      ((d.duty_type === "INVIGILATOR" &&
                        d.account_role === "FACULTY") ||
                        (d.duty_type === "TA" && d.account_role === "TA")),
                  ),
                  faculty = assigned.filter(
                    (d) => d.duty_type === "INVIGILATOR",
                  ),
                  tas = assigned.filter((d) => d.duty_type === "TA");
                return (
                  <tr key={exam.id}>
                    <td>
                      <strong>
                        {exam.code} · {exam.exam_type}
                      </strong>
                      <small>{exam.title}</small>
                      <Badge value={exam.status} />
                    </td>
                    <td>
                      {exam.venue}
                      <small>
                        {dateLabel(exam.date)} · {exam.start_time}–
                        {exam.end_time}
                      </small>
                    </td>
                    <td>
                      {faculty.map((d) => d.name).join(", ") || (
                        <span className="text-amber-700">
                          Needs faculty invigilator
                        </span>
                      )}
                    </td>
                    <td>
                      {tas.map((d) => d.name).join(", ") || "None assigned"}
                    </td>
                    <td>
                      <button
                        className="text-brand font-semibold"
                        onClick={() => setAdding(exam.id)}
                      >
                        Assign staff
                      </button>
                    </td>
                  </tr>
                );
              })}
            </Table>
          ) : (
            <Empty
              title="No upcoming examinations to staff"
              description="Create an examination schedule first."
            />
          )}
        </Panel>
      )}
      <Panel
        title={admin ? "Staff duty records" : "Assigned hall duties"}
        subtitle={
          admin
            ? "Duty changes are recorded with the responsible administrator and timestamp."
            : "Draft schedules are not shown. Date and venue follow the current published schedule."
        }
      >
        <div className="toolbar flex flex-wrap items-center justify-between gap-3 p-5">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder={
              admin ? "Search staff, course or hall…" : "Search course or hall…"
            }
          />
          <select
            aria-label="Duty status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ASSIGNED">Assigned duties</option>
            <option value="CANCELLED">Cancelled duties</option>
            <option value="">All duties</option>
          </select>
        </div>
        {duties.loading ? (
          <Loading />
        ) : rows.length ? (
          <Table
            headers={[
              ...(admin ? ["Staff member"] : []),
              "Duty",
              "Examination",
              "Date / venue",
              "Status",
              "Actions",
            ]}
          >
            {rows.map((d) => (
              <tr key={d.id}>
                {admin && (
                  <td>
                    <strong>{d.name}</strong>
                    <small>{d.email}</small>
                  </td>
                )}
                <td>
                  {d.duty_type === "TA"
                    ? "Teaching assistant"
                    : "Faculty invigilator"}
                </td>
                <td>
                  <strong>{d.code}</strong>
                  <small>
                    {d.title} · {d.exam_type}
                  </small>
                </td>
                <td>
                  {dateLabel(d.date)}
                  <small>
                    {d.start_time}–{d.end_time} IST · {d.venue}
                  </small>
                </td>
                <td>
                  <Badge value={d.status} />
                  {d.exam_status !== "PUBLISHED" && (
                    <small>Schedule: {d.exam_status.toLowerCase()}</small>
                  )}
                </td>
                <td>
                  <div className="flex flex-wrap gap-3">
                    {d.status === "ASSIGNED" &&
                      d.exam_status === "PUBLISHED" && (
                        <button
                          className="text-brand font-semibold"
                          onClick={() => setRosterId(d.exam_id)}
                        >
                          Hall roster
                        </button>
                      )}
                    {admin && d.status === "ASSIGNED" && upcoming(d) && (
                      <button
                        className="text-red-700"
                        onClick={() => setRemoving(d)}
                      >
                        Remove duty
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <Empty
            title="No duties in this selection"
            description={
              admin
                ? "Assign staff to an upcoming examination to create duty records."
                : "The examination office will assign your duties. You cannot assign or remove duties yourself."
            }
          />
        )}
      </Panel>
      {adding !== null && (
        <Modal
          title="Assign examination hall duty"
          onClose={() => setAdding(null)}
        >
          <p className="mb-5 text-sm text-muted">
            Faculty accounts are assigned as invigilators; TA accounts as
            teaching assistants. Conflicting duties are blocked.
          </p>
          <RecordForm
            initial={adding ? { examId: adding } : {}}
            fields={[
              {
                name: "examId",
                label: "Examination",
                type: "select",
                options: editable.map((e) => ({
                  value: e.id,
                  label: `${e.code} · ${e.exam_type} · ${dateLabel(e.date)} · ${e.venue}`,
                })),
              },
              {
                name: "userId",
                label: "Staff member",
                type: "select",
                options: staff.data?.map((p) => ({
                  value: p.id,
                  label: `${p.name} · ${p.role === "TA" ? "Teaching assistant" : "Faculty invigilator"}`,
                })),
              },
            ]}
            submitLabel="Assign duty"
            onClose={() => setAdding(null)}
            onSave={async (values) => {
              await api("/duties", "POST", values);
              refresh();
              notify("Examination duty assigned.");
            }}
          />
        </Modal>
      )}
      {removing && (
        <Confirm
          title="Remove examination duty"
          message={`Remove ${removing.name} from ${removing.code} ${removing.exam_type}? Record the reason; assign replacement staff where needed.`}
          reasonRequired
          onClose={() => setRemoving(null)}
          onConfirm={async (reason) => {
            await api(`/duties/${removing.id}`, "DELETE", { reason });
            refresh();
            notify("Duty removed; the change has been recorded.");
          }}
        />
      )}
      {rosterId && (
        <Modal
          title="Examination hall roster"
          wide
          onClose={() => setRosterId("")}
        >
          <ErrorMessage message={roster.error} />
          {roster.loading ? (
            <Loading />
          ) : (
            roster.data && (
              <>
                <div className="mb-5">
                  <h3>
                    {roster.data.exam.code} · {roster.data.exam.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {roster.data.exam.exam_type} ·{" "}
                    {dateLabel(roster.data.exam.date)} ·{" "}
                    {roster.data.exam.start_time}–{roster.data.exam.end_time}{" "}
                    IST · {roster.data.exam.venue}
                  </p>
                </div>
                {roster.data.students.length ? (
                  <Table headers={["Seat", "Roll number", "Student name"]}>
                    {roster.data.students.map((s) => (
                      <tr key={s.student_id}>
                        <td>{s.seat}</td>
                        <td>{s.roll_no}</td>
                        <td>{s.name}</td>
                      </tr>
                    ))}
                  </Table>
                ) : (
                  <Empty title="No active registrations" />
                )}
                <div className="modal-actions mt-5 flex justify-end gap-3 print:hidden">
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-brand"
                    onClick={() => window.print()}
                  >
                    <Printer size={16} />
                    Print roster
                  </button>
                  <button
                    className="rounded-lg bg-brand px-4 py-2 text-white"
                    onClick={() => setRosterId("")}
                  >
                    Close
                  </button>
                </div>
              </>
            )
          )}
        </Modal>
      )}
    </>
  );
}
