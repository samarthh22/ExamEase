import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCheck,
  Clock,
  Download,
  GraduationCap,
  MapPin,
  Plus,
  Printer,
  Users,
} from "lucide-react";
import { api, useData } from "../api";
import {
  Badge,
  Confirm,
  Empty,
  ErrorMessage,
  Heading,
  LinkButton,
  Loading,
  Modal,
  Panel,
  RecordForm,
  SearchBox,
  Stat,
  Table,
  dateLabel,
  useApp,
  type Field,
  type FormValues,
} from "../ui";
import type {
  Course,
  CourseReport,
  Exam,
  Faculty,
  Registration,
  ResultRow,
  Student,
} from "../../shared/types";
const matches = (query: string, ...parts: unknown[]) =>
  parts.join(" ").toLowerCase().includes(query.toLowerCase());
export function Home() {
  const { user, version } = useApp(),
    { data: exams, error, loading } = useData<Exam[]>("/exams", version),
    { data: courses } = useData<Course[]>("/courses", version),
    { data: reports } = useData<CourseReport[]>(
      user.role === "STUDENT" ? "" : "/reports/courses",
      version,
    );
  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  const upcoming = (exams || []).filter(
      (e) =>
        e.status === "PUBLISHED" &&
        new Date(`${e.date}T${e.end_time}:00+05:30`).getTime() > Date.now(),
    ),
    pending = (exams || []).filter(
      (e) => e.status === "PUBLISHED" && !e.results_published,
    ),
    published = (exams || []).filter((e) => e.results_published),
    admin = user.role === "EXAM_ADMIN",
    faculty = user.role === "FACULTY",
    student = user.role === "STUDENT";
  return (
    <>
      <Heading
        title={
          student
            ? `Welcome back, ${user.name.split(" ")[0]}`
            : "Examination overview"
        }
        description={
          student
            ? "Your courses, examinations and results, all in one place."
            : faculty
              ? "Your assigned examinations and evaluation progress at a glance."
              : "A clear view of schedules, evaluation progress and published results."
        }
        action={
          <div className="today">
            <CalendarDays size={17} />
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Kolkata",
            })}
          </div>
        }
      />
      <section className="overview-banner">
        <div>
          <span className="banner-tag">
            <span />{" "}
            {student ? "YOUR ACADEMIC WORKSPACE" : "EXAMINATION WORKSPACE"}
          </span>
          <h2>
            {student
              ? "Stay ready for what’s next."
              : "A smoother examination cycle starts here."}
          </h2>
          <p>
            {student
              ? "Review upcoming schedules, confirm your registrations and check published results."
              : "Keep schedules organized and move every examination from registration to results."}
          </p>
          <a
            className="banner-link"
            href={
              admin
                ? "#schedule"
                : faculty
                  ? "#marks"
                  : student
                    ? "#registrations"
                    : "#reports"
            }
          >
            {admin
              ? "Manage examinations"
              : faculty
                ? "Continue evaluation"
                : student
                  ? "View registrations"
                  : "Explore reports"}
            <ArrowRight size={17} />
          </a>
        </div>
        <div className="banner-illustration" aria-hidden="true">
          <div className="mini-calendar">
            <div className="calendar-top">
              <span />
              <span />
            </div>
            <CalendarDays size={46} />
            <div className="calendar-lines">
              <i />
              <i />
              <i />
            </div>
            <span className="calendar-check">
              <CheckCheck size={22} />
            </span>
          </div>
          <div className="floating-label">
            <CheckCheck size={16} />
            Organized. Connected. Clear.
          </div>
        </div>
      </section>
      <div className="stats-grid">
        <Stat
          label={student ? "Enrolled courses" : "Courses"}
          value={courses?.length || 0}
          detail={
            user.role === "HOD" ? user.department : "Current academic records"
          }
          icon={<BookOpen size={19} />}
        />
        <Stat
          label="Upcoming examinations"
          value={upcoming.length}
          detail="Published schedules"
          icon={<CalendarDays size={19} />}
        />
        <Stat
          label="Published results"
          value={published.length}
          detail="Available to students"
          icon={<CheckCheck size={19} />}
        />
        <Stat
          label="Awaiting publication"
          value={pending.length}
          detail="Across scheduled examinations"
          icon={<Clock size={19} />}
        />
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Upcoming examinations"
          subtitle="Plan ahead with the latest published schedules"
          action={<LinkButton to="schedule">View all</LinkButton>}
        >
          {upcoming.length ? (
            <div className="exam-list">
              {upcoming.slice(0, 4).map((e) => (
                <div className="exam-list-row" key={e.id}>
                  <div className="date-tile">
                    <strong>{e.date.slice(-2)}</strong>
                    <span>
                      {new Date(`${e.date}T00:00:00`).toLocaleDateString("en", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="exam-list-detail">
                    <span className="course-code">{e.code}</span>
                    <h3>{e.title}</h3>
                    <p>
                      {e.exam_type} <span>·</span> {e.start_time}–{e.end_time}{" "}
                      IST
                    </p>
                  </div>
                  <div className="exam-location">
                    <MapPin size={14} />
                    {e.venue}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="No upcoming examinations"
              description="Published examinations will appear here."
            />
          )}
        </Panel>
        <Panel
          title={student ? "Your courses" : "Evaluation progress"}
          subtitle={
            student
              ? "Current course enrollments"
              : "Saved marks across registered students"
          }
          action={
            <LinkButton to={student ? "courses" : "reports"}>
              View all
            </LinkButton>
          }
        >
          {student ? (
            <div className="course-mini-list">
              {courses?.map((c) => (
                <div key={c.id}>
                  <div className="course-icon">
                    <BookOpen size={19} />
                  </div>
                  <div>
                    <strong>{c.code}</strong>
                    <p>{c.title}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="progress-list">
              {reports
                ?.filter((r) => r.registered > 0)
                .slice(0, 4)
                .map((r) => (
                  <div key={r.exam.id}>
                    <div className="progress-label">
                      <strong>
                        {r.exam.code}
                        <small>{r.exam.exam_type}</small>
                      </strong>
                      <span>
                        {r.statistics.count}/{r.registered}
                      </span>
                    </div>
                    <div className="progress-track">
                      <i
                        style={{
                          width: `${r.registered ? (r.statistics.count / r.registered) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="progress-caption">
                      {r.exam.results_published
                        ? "Results published"
                        : r.statistics.count === r.registered
                          ? "Marks complete · ready for grading"
                          : "Evaluation in progress"}
                    </div>
                  </div>
                ))}
              {!reports?.some((r) => r.registered > 0) && (
                <Empty title="Evaluation has not started" />
              )}
            </div>
          )}
        </Panel>
      </div>
      <Panel
        title="Your next steps"
        subtitle="Continue the examination workflow"
      >
        <div className="quick-actions">
          {(admin
            ? [
                [
                  "schedule",
                  "Create a schedule",
                  "Set dates, times and venues",
                  CalendarDays,
                ],
                [
                  "records",
                  "Manage academic records",
                  "Students, faculty and enrollments",
                  Users,
                ],
                [
                  "publication",
                  "Review result publication",
                  "Publish prepared examination results",
                  CheckCheck,
                ],
              ]
            : faculty
              ? [
                  [
                    "marks",
                    "Enter and review marks",
                    "Save marks for your registered roster",
                    PenIcon,
                  ],
                  [
                    "marks",
                    "Configure grading",
                    "Review statistics and define boundaries",
                    GraduationCap,
                  ],
                  [
                    "reports",
                    "Review performance",
                    "Course statistics and grade distributions",
                    BookOpen,
                  ],
                ]
              : student
                ? [
                    [
                      "registrations",
                      "Register for an examination",
                      "Choose an eligible course examination",
                      CalendarDays,
                    ],
                    [
                      "schedule",
                      "Check your schedule",
                      "Know when and where to attend",
                      Clock,
                    ],
                    [
                      "results",
                      "View your results",
                      "See your published marks and grades",
                      CheckCheck,
                    ],
                  ]
                : [
                    [
                      "reports",
                      "Department performance",
                      "Review statistics across your department",
                      GraduationCap,
                    ],
                    [
                      "schedule",
                      "Examination schedules",
                      "Review the latest examination dates",
                      CalendarDays,
                    ],
                    [
                      "courses",
                      "Course overview",
                      "Browse department courses and faculty",
                      BookOpen,
                    ],
                  ]
          ).map(([to, title, desc, Icon]) => {
            const I = Icon as typeof BookOpen;
            return (
              <a href={`#${to}`} className="quick-action" key={String(title)}>
                <span>
                  <I size={21} />
                </span>
                <div>
                  <h3>{String(title)}</h3>
                  <p>{String(desc)}</p>
                </div>
                <ArrowRight size={17} />
              </a>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
const PenIcon = GraduationCap;
export function Courses() {
  const { user, version, refresh, notify } = useApp(),
    admin = user.role === "EXAM_ADMIN";
  const { data, error, loading } = useData<Course[]>("/courses", version),
    { data: faculty } = useData<Faculty[]>(admin ? "/faculty" : "", version);
  const [search, setSearch] = useState(""),
    [edit, setEdit] = useState<Course | null | undefined>();
  const fields: Field[] = [
    { name: "code", label: "Course code" },
    { name: "title", label: "Course title" },
    {
      name: "credits",
      label: "Credits",
      type: "number",
      min: 0.5,
      max: 30,
      step: "0.5",
    },
    { name: "department", label: "Department" },
    { name: "semester", label: "Semester / academic year" },
    {
      name: "faculty_id",
      label: "Assigned faculty",
      type: "select",
      required: false,
      options: faculty?.map((f) => ({ value: f.id, label: f.name || f.id })),
    },
    { name: "active", label: "Course is active", type: "checkbox" },
  ];
  return (
    <>
      <Heading
        title="Courses"
        description={
          admin
            ? "Maintain your course catalogue and faculty assignments."
            : "Your course catalogue and assigned faculty."
        }
        action={
          admin && (
            <button className="button" onClick={() => setEdit(null)}>
              <Plus size={18} />
              Add course
            </button>
          )
        }
      />
      <Panel>
        <div className="toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search code, title or department…"
          />
          <span className="muted">{data?.length || 0} courses</span>
        </div>
        <ErrorMessage message={error} />
        {loading ? (
          <Loading />
        ) : data?.length ? (
          <Table
            headers={[
              "Course",
              "Department / semester",
              "Faculty",
              "Credits",
              "Status",
              ...(admin ? ["Actions"] : []),
            ]}
          >
            {data
              .filter((c) => matches(search, c.code, c.title, c.department))
              .map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="course-code">{c.code}</span>
                    <strong className="cell-title">{c.title}</strong>
                  </td>
                  <td>
                    {c.department}
                    <small>{c.semester}</small>
                  </td>
                  <td>{c.faculty_name || "Unassigned"}</td>
                  <td>{c.credits}</td>
                  <td>
                    <Badge value={c.active ? "Active" : "Inactive"} />
                  </td>
                  {admin && (
                    <td>
                      <button
                        className="text-button"
                        onClick={() => setEdit(c)}
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </Table>
        ) : (
          <Empty title="No courses yet" />
        )}
      </Panel>
      {edit !== undefined && (
        <Modal
          title={edit ? "Edit course" : "Add course"}
          onClose={() => setEdit(undefined)}
        >
          <RecordForm
            fields={fields}
            initial={
              edit
                ? {
                    code: edit.code,
                    title: edit.title,
                    credits: edit.credits,
                    department: edit.department,
                    semester: edit.semester,
                    faculty_id: edit.faculty_id,
                    active: !!edit.active,
                  }
                : {
                    active: true,
                    department: user.department,
                    semester: "2026 · Semester V",
                    credits: 4,
                  }
            }
            onClose={() => setEdit(undefined)}
            onSave={async (v) => {
              await api(
                `/courses${edit ? `/${edit.id}` : ""}`,
                edit ? "PUT" : "POST",
                { ...v, faculty_id: v.faculty_id || null },
              );
              refresh();
              notify("Course saved.");
            }}
          />
        </Modal>
      )}
    </>
  );
}
export function Schedule() {
  const { user, version, refresh, notify } = useApp(),
    admin = user.role === "EXAM_ADMIN";
  const { data, error, loading } = useData<Exam[]>("/exams", version),
    { data: courses } = useData<Course[]>("/courses", version);
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [edit, setEdit] = useState<Exam | null | undefined>();
  const fields: Field[] = [
    {
      name: "course_id",
      label: "Course",
      type: "select",
      options: courses
        ?.filter((c) => c.active)
        .map((c) => ({ value: c.id, label: `${c.code} · ${c.title}` })),
    },
    { name: "exam_type", label: "Examination type" },
    { name: "date", label: "Date", type: "date" },
    { name: "venue", label: "Venue" },
    { name: "start_time", label: "Start time (IST)", type: "time" },
    { name: "end_time", label: "End time (IST)", type: "time" },
    {
      name: "max_marks",
      label: "Maximum marks",
      type: "number",
      min: 1,
      max: 10000,
      step: "any",
    },
    {
      name: "status",
      label: "Schedule status",
      type: "select",
      options: ["DRAFT", "PUBLISHED", "CANCELLED"].map((v) => ({
        value: v,
        label: v,
      })),
    },
  ];
  return (
    <>
      <Heading
        title="Exam schedules"
        description="Examination dates, times and venues. All times are in IST."
        action={
          admin && (
            <button className="button" onClick={() => setEdit(null)}>
              <Plus size={18} />
              Create examination
            </button>
          )
        }
      />
      <Panel>
        <div className="toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search course or venue…"
          />
          <select
            aria-label="Filter schedule status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {["DRAFT", "PUBLISHED", "CANCELLED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <ErrorMessage message={error} />
        {loading ? (
          <Loading />
        ) : data?.length ? (
          <Table
            headers={[
              "Course / examination",
              "Date & time",
              "Venue",
              "Max marks",
              "Status",
              ...(admin ? ["Actions"] : []),
            ]}
          >
            {data
              .filter(
                (e) =>
                  matches(search, e.code, e.title, e.venue) &&
                  (!status || e.status === status),
              )
              .map((e) => (
                <tr key={e.id}>
                  <td>
                    <span className="course-code">{e.code}</span>
                    <strong className="cell-title">{e.title}</strong>
                    <small>{e.exam_type}</small>
                  </td>
                  <td>
                    {dateLabel(e.date)}
                    <small>
                      {e.start_time}–{e.end_time} IST
                    </small>
                  </td>
                  <td>{e.venue}</td>
                  <td>{e.max_marks}</td>
                  <td>
                    <Badge value={e.status} />
                  </td>
                  {admin && (
                    <td>
                      <button
                        className="text-button"
                        onClick={() => setEdit(e)}
                      >
                        Edit schedule
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </Table>
        ) : (
          <Empty
            title="No examination schedules"
            description="Published schedules for your courses will appear here."
          />
        )}
      </Panel>
      {edit !== undefined && (
        <Modal
          title={edit ? "Edit examination" : "Create examination"}
          onClose={() => setEdit(undefined)}
        >
          <RecordForm
            fields={fields}
            initial={
              edit
                ? (Object.fromEntries(
                    fields.map((f) => [f.name, edit[f.name as keyof Exam]]),
                  ) as FormValues)
                : {
                    exam_type: "End semester",
                    max_marks: 100,
                    status: "DRAFT",
                    start_time: "09:00",
                    end_time: "12:00",
                  }
            }
            onClose={() => setEdit(undefined)}
            onSave={async (v) => {
              await api(
                `/exams${edit ? `/${edit.id}` : ""}`,
                edit ? "PUT" : "POST",
                v,
              );
              refresh();
              notify("Examination schedule saved.");
            }}
          />
        </Modal>
      )}
    </>
  );
}
export function Registrations() {
  const { user, version, refresh, notify } = useApp(),
    student = user.role === "STUDENT";
  const { data, error, loading } = useData<Registration[]>(
      "/registrations",
      version,
    ),
    { data: eligible } = useData<Exam[]>(
      student ? "/registrations/eligible-exams" : "/exams",
      version,
    ),
    { data: students } = useData<Student[]>(
      student ? "" : "/students",
      version,
    );
  const [receipt, setReceipt] = useState<Registration | null>(null),
    [cancel, setCancel] = useState<Registration | null>(null),
    [search, setSearch] = useState(""),
    [register, setRegister] = useState<Exam | null>(null),
    [adding, setAdding] = useState(false);
  return (
    <>
      <Heading
        title="Examination registrations"
        description={
          student
            ? "Register for eligible examinations and keep your receipts in one place."
            : "Review student registrations and register enrolled students for examinations."
        }
        action={
          !student && (
            <button className="button" onClick={() => setAdding(true)}>
              <Plus size={18} />
              Register student
            </button>
          )
        }
      />
      {student && (
        <>
          <div className="section-title">
            <h2>Available examinations</h2>
            <span>For your enrolled courses</span>
          </div>
          <div className="exam-card-grid">
            {eligible?.map((e) => (
              <article className="exam-card" key={e.id}>
                <div className="exam-card-top">
                  <span className="course-code">{e.code}</span>
                  <Badge
                    value={
                      e.registration_status === "REGISTERED"
                        ? "REGISTERED"
                        : "Eligible"
                    }
                  />
                </div>
                <h3>{e.title}</h3>
                <p>
                  {e.exam_type} · {e.max_marks} marks
                </p>
                <div className="exam-meta">
                  <span>
                    <CalendarDays size={16} />
                    {dateLabel(e.date)}
                  </span>
                  <span>
                    <Clock size={16} />
                    {e.start_time}–{e.end_time} IST
                  </span>
                  <span>
                    <MapPin size={16} />
                    {e.venue}
                  </span>
                </div>
                <button
                  className={`button ${e.registration_status === "REGISTERED" ? "secondary" : ""}`}
                  disabled={e.registration_status === "REGISTERED"}
                  onClick={() => setRegister(e)}
                >
                  {e.registration_status === "REGISTERED"
                    ? "Registered"
                    : "Register for examination"}
                  {e.registration_status !== "REGISTERED" && (
                    <ArrowRight size={16} />
                  )}
                </button>
              </article>
            ))}
          </div>
          {eligible?.length === 0 && (
            <Panel>
              <Empty
                title="No examinations available for registration"
                description="Upcoming published examinations for your enrolled courses will appear here."
              />
            </Panel>
          )}
        </>
      )}
      <Panel
        title={student ? "My registrations" : "Registration records"}
        subtitle="Current status and examination receipts"
      >
        <div className="toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search registrations…"
          />
          <span className="muted">{data?.length || 0} records</span>
        </div>
        <ErrorMessage message={error} />
        {loading ? (
          <Loading />
        ) : data?.length ? (
          <Table
            headers={[
              ...(!student ? ["Student"] : []),
              "Examination",
              "Date & venue",
              "Registration",
              "Actions",
            ]}
          >
            {data
              .filter((r) =>
                matches(search, r.code, r.title, r.roll_no, r.name),
              )
              .map((r) => (
                <tr key={r.id}>
                  {!student && (
                    <td>
                      <strong>{r.name}</strong>
                      <small>{r.roll_no}</small>
                    </td>
                  )}
                  <td>
                    <span className="course-code">{r.code}</span>
                    <strong className="cell-title">{r.title}</strong>
                    <small>{r.exam_type}</small>
                  </td>
                  <td>
                    {dateLabel(r.date)}
                    <small>{r.venue}</small>
                    {r.exam_status === "CANCELLED" && (
                      <Badge value="CANCELLED" />
                    )}
                  </td>
                  <td>
                    <Badge value={r.status} />
                    <small>Seat {r.seat}</small>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="text-button"
                        onClick={() => setReceipt(r)}
                      >
                        View receipt
                      </button>
                      {r.status === "REGISTERED" &&
                        new Date(
                          `${r.date}T${r.start_time}:00+05:30`,
                        ).getTime() > Date.now() && (
                          <button
                            className="text-button danger"
                            onClick={() => setCancel(r)}
                          >
                            Cancel
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
          </Table>
        ) : (
          <Empty title="No registrations yet" />
        )}
      </Panel>
      {register && (
        <Confirm
          title="Confirm examination registration"
          message={`Register for ${register.code} ${register.exam_type} on ${dateLabel(register.date)} at ${register.venue}?`}
          onClose={() => setRegister(null)}
          onConfirm={async () => {
            const r = await api<Registration>("/registrations", "POST", {
              examScheduleId: register.id,
            });
            refresh();
            setReceipt(r);
            notify("Registration successful.");
          }}
        />
      )}
      {cancel && (
        <Confirm
          title="Cancel registration"
          message={`Cancel the registration for ${cancel.code} ${cancel.exam_type}? You can register again before the examination starts.`}
          onClose={() => setCancel(null)}
          onConfirm={async () => {
            await api(`/registrations/${cancel.id}`, "DELETE");
            refresh();
            notify("Registration cancelled.");
          }}
        />
      )}
      {receipt && (
        <Modal title="Registration receipt" onClose={() => setReceipt(null)}>
          <div className="receipt">
            <div className="receipt-brand">
              <GraduationCap size={28} />
              <strong>ExamEase</strong>
            </div>
            <Badge value={receipt.status} />
            <h3>{receipt.title}</h3>
            <p>
              {receipt.code} · {receipt.exam_type}
            </p>
            <dl>
              {[
                ["Student", `${receipt.name} · ${receipt.roll_no}`],
                [
                  "Examination",
                  `${dateLabel(receipt.date)} · ${receipt.start_time}–${receipt.end_time} IST`,
                ],
                ["Hall / venue", receipt.venue],
                ["Seat", receipt.seat],
                ["Registration ID", receipt.id],
                [
                  "Registered on",
                  new Date(receipt.created_at).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  }),
                ],
                ["Schedule status", receipt.exam_status],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="modal-actions">
            <button className="button secondary" onClick={() => window.print()}>
              <Printer size={16} />
              Print slip
            </button>
            <button className="button" onClick={() => setReceipt(null)}>
              Done
            </button>
          </div>
        </Modal>
      )}
      {adding && (
        <Modal title="Register student" onClose={() => setAdding(false)}>
          <RecordForm
            fields={[
              {
                name: "studentId",
                label: "Student",
                type: "select",
                options: students?.map((s) => ({
                  value: s.id,
                  label: `${s.roll_no} · ${s.name}`,
                })),
              },
              {
                name: "examScheduleId",
                label: "Examination",
                type: "select",
                options: eligible
                  ?.filter(
                    (e) =>
                      e.status === "PUBLISHED" &&
                      new Date(`${e.date}T${e.start_time}:00+05:30`).getTime() >
                        Date.now(),
                  )
                  .map((e) => ({
                    value: e.id,
                    label: `${e.code} · ${e.exam_type} · ${dateLabel(e.date)}`,
                  })),
              },
            ]}
            onClose={() => setAdding(false)}
            onSave={async (v) => {
              const r = await api<Registration>("/registrations", "POST", v);
              refresh();
              setReceipt(r);
              notify("Student registered.");
            }}
          />
        </Modal>
      )}
    </>
  );
}
function ResultTable({ rows }: { rows: ResultRow[] }) {
  return rows.length ? (
    <Table headers={["Course / examination", "Marks", "Grade", "Publication"]}>
      {rows.map((r) => (
        <tr key={r.id}>
          <td>
            <span className="course-code">{r.code}</span>
            <strong className="cell-title">{r.title}</strong>
            <small>
              {r.exam_type} · {dateLabel(r.date)}
            </small>
          </td>
          <td>
            {r.status === "PUBLISHED" ? (
              <>
                <strong>{r.marks_obtained}</strong>
                <span className="muted"> / {r.max_marks}</span>
              </>
            ) : (
              "—"
            )}
          </td>
          <td>
            {r.grade ? (
              <span className={`grade ${r.grade === "F" ? "fail" : ""}`}>
                {r.grade}
              </span>
            ) : (
              "—"
            )}
          </td>
          <td>
            <Badge value={r.status || "Pending"} />
            {r.published_at && (
              <small>
                {new Date(r.published_at).toLocaleDateString("en-IN")}
              </small>
            )}
          </td>
        </tr>
      ))}
    </Table>
  ) : (
    <Empty
      title="No result records"
      description="Results appear here after examination registration."
    />
  );
}
export function Results() {
  const { version } = useApp(),
    { data, error, loading } = useData<ResultRow[]>("/results", version);
  return (
    <>
      <Heading
        title="My results"
        description="Your marks and grades become visible after official publication."
      />
      <Panel
        title="Examination results"
        subtitle="Only your own published marks and grades are shown"
      >
        <ErrorMessage message={error} />
        {loading ? <Loading /> : <ResultTable rows={data || []} />}
      </Panel>
    </>
  );
}
function exportReports(rows: CourseReport[]) {
  const csv = [
    [
      "Course",
      "Examination",
      "Date",
      "Registered",
      "Evaluated",
      "Mean",
      "Median",
      "Std deviation",
      "Passed",
      "Failed",
      "Pass rate",
    ],
    ...rows.map((r) => [
      r.exam.code,
      r.exam.exam_type,
      r.exam.date,
      r.registered,
      r.statistics.count,
      r.statistics.mean,
      r.statistics.median,
      r.statistics.std_dev,
      r.passed,
      r.failed,
      r.passRate,
    ]),
  ]
    .map((row) =>
      row
        .map(
          (v) =>
            `"${String(v ?? "")
              .replace(/^[=+@-]/, "'$&")
              .replaceAll('"', '""')}"`,
        )
        .join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "examease-course-report.csv";
  a.click();
  URL.revokeObjectURL(url);
}
export function Reports() {
  const { user, version } = useApp(),
    { data, error, loading } = useData<CourseReport[]>(
      "/reports/courses",
      version,
    ),
    { data: students } = useData<Student[]>(
      user.role === "EXAM_ADMIN" ? "/students" : "",
      version,
    );
  const [department, setDepartment] = useState(""),
    [examId, setExamId] = useState(""),
    [studentId, setStudentId] = useState("");
  const { data: studentRows, error: studentError } = useData<ResultRow[]>(
    studentId ? `/reports/student/${studentId}` : "",
    version,
  );
  const rows = (data || []).filter(
      (r) => !department || r.exam.department === department,
    ),
    selected =
      rows.find((r) => r.exam.id === examId) ||
      rows.find((r) => r.statistics.count > 0) ||
      rows[0];
  return (
    <>
      <Heading
        title="Reports & analytics"
        description={
          user.role === "HOD"
            ? `Read-only examination performance for ${user.department}.`
            : "Review class performance, grade distributions and published pass/fail statistics."
        }
        action={
          <button
            className="button secondary"
            disabled={!rows.length}
            onClick={() => exportReports(rows)}
          >
            <Download size={17} />
            Export CSV
          </button>
        }
      />
      <ErrorMessage message={error} />
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="toolbar report-filters">
            <label>
              Department
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setExamId("");
                }}
              >
                <option value="">All accessible departments</option>
                {[...new Set(data?.map((r) => r.exam.department))].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label>
              Examination
              <select
                value={selected?.exam.id || ""}
                onChange={(e) => setExamId(e.target.value)}
              >
                {rows.map((r) => (
                  <option key={r.exam.id} value={r.exam.id}>
                    {r.exam.code} · {r.exam.exam_type}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {selected ? (
            <>
              <div className="stats-grid">
                <Stat
                  label="Class mean"
                  value={selected.statistics.mean ?? "—"}
                  detail={`Out of ${selected.exam.max_marks} marks`}
                />
                <Stat
                  label="Median"
                  value={selected.statistics.median ?? "—"}
                  detail={`${selected.statistics.count} evaluated students`}
                />
                <Stat
                  label="Standard deviation"
                  value={selected.statistics.std_dev ?? "—"}
                  detail="Population standard deviation"
                />
                <Stat
                  label="Published pass rate"
                  value={
                    selected.passRate === null ? "—" : `${selected.passRate}%`
                  }
                  detail={`${selected.passed} passed · ${selected.failed} failed`}
                />
              </div>
              <div className="dashboard-grid">
                <Panel
                  title="Grade distribution"
                  subtitle="Based on published results only"
                >
                  <div className="distribution">
                    {selected.distribution.length ? (
                      selected.distribution.map((d) => (
                        <div key={d.grade}>
                          <span className="distribution-grade">{d.grade}</span>
                          <div className="progress-track">
                            <i
                              style={{
                                width: `${(d.count / Math.max(...selected.distribution.map((x) => x.count))) * 100}%`,
                              }}
                            />
                          </div>
                          <strong>{d.count}</strong>
                          <span>students</span>
                        </div>
                      ))
                    ) : (
                      <Empty
                        title="Results are not published yet"
                        description="The distribution appears after official publication."
                      />
                    )}
                  </div>
                </Panel>
                <Panel
                  title="Examination summary"
                  subtitle={`${selected.exam.code} · ${selected.exam.exam_type}`}
                >
                  <dl className="summary-list">
                    <div>
                      <dt>Registered students</dt>
                      <dd>{selected.registered}</dd>
                    </div>
                    <div>
                      <dt>Missing marks / absent</dt>
                      <dd>{selected.pending}</dd>
                    </div>
                    <div>
                      <dt>Highest mark</dt>
                      <dd>{selected.statistics.highest ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Lowest mark</dt>
                      <dd>{selected.statistics.lowest ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Result status</dt>
                      <dd>
                        <Badge
                          value={
                            selected.exam.results_published
                              ? "PUBLISHED"
                              : "UNPUBLISHED"
                          }
                        />
                      </dd>
                    </div>
                  </dl>
                </Panel>
              </div>
            </>
          ) : (
            <Panel>
              <Empty title="No examination reports yet" />
            </Panel>
          )}
          <Panel
            title="Course performance"
            subtitle="F is the failing grade; other configured grades count as passing"
          >
            <Table
              headers={[
                "Course / examination",
                "Evaluated",
                "Mean",
                "Median",
                "Highest / lowest",
                "Pass / fail",
              ]}
            >
              {rows.map((r) => (
                <tr key={r.exam.id}>
                  <td>
                    <strong>{r.exam.code}</strong>
                    <small>{r.exam.exam_type}</small>
                  </td>
                  <td>
                    {r.statistics.count} / {r.registered}
                  </td>
                  <td>{r.statistics.mean ?? "—"}</td>
                  <td>{r.statistics.median ?? "—"}</td>
                  <td>
                    {r.statistics.highest ?? "—"} / {r.statistics.lowest ?? "—"}
                  </td>
                  <td>
                    {r.passed} / {r.failed}
                  </td>
                </tr>
              ))}
            </Table>
          </Panel>
        </>
      )}
      {user.role === "EXAM_ADMIN" && (
        <Panel
          title="Student-wise report"
          subtitle="Published marks and grades across registered courses"
        >
          <div className="toolbar">
            <select
              aria-label="Select student for report"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">Choose a student…</option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.roll_no} · {s.name}
                </option>
              ))}
            </select>
          </div>
          <ErrorMessage message={studentError} />
          {studentId && <ResultTable rows={studentRows || []} />}
        </Panel>
      )}
    </>
  );
}
