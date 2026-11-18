import { cn } from "../cn";
import { useState, type CSSProperties } from "react";
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
    { data: ownResults, error: ownResultsError } = useData<ResultRow[]>(
      user.role === "STUDENT" ? "/results" : "",
      version,
    ),
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
          <div
            className={
              "today flex items-center text-[13px] text-[#6b7a71] bg-[#fff] border border-solid border-line rounded-[7px] whitespace-nowrap px-[13px] py-[10px] gap-2 max-tablet:hidden"
            }
          >
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
      <section
        className={
          "overview-banner flex justify-between bg-[#e9f2ed] border border-solid border-[#dfeae2] rounded-[11px] mb-6 overflow-hidden min-h-48 relative px-[29px] py-[26px] gap-[30px] [&_h2]:text-[23px] [&_h2]:tracking-[-0.6px] [&_h2]:text-[#254e3d] [&_h2]:mt-[10px] [&_h2]:mb-[9px] [&_h2]:mx-0 [&_p]:text-[13px] [&_p]:text-[#697b6e] [&_p]:max-w-[490px] [&_p]:leading-[1.7] cinema:min-h-55 cinema:[&_h2]:text-[28px] cinema:[&_p]:text-[14px] cinema:[&_>_div:first-child]:self-center max-wide:[&_h2]:text-[21px] max-tablet:p-[22px] max-mobile:min-h-[210px] max-mobile:px-[22px] max-mobile:py-6 max-mobile:[&_h2]:text-[23px] max-mobile:[&_h2]:max-w-[270px] max-mobile:[&_p]:text-[13px]"
        }
      >
        <div>
          <span
            className={
              "banner-tag inline-flex items-center tracking-[1.2px] text-[10px] font-bold text-[#5b876c] gap-[6px] [&_>_span]:h-[5px] [&_>_span]:w-[5px] [&_>_span]:bg-[#58926a] [&_>_span]:rounded-full"
            }
          >
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
            className={
              "banner-link mt-5 inline-flex items-center text-[#32734e] text-[13px] font-semibold gap-[10px]"
            }
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
        <div
          className={
            "banner-illustration w-[230px] shrink-0 relative flex items-center justify-center max-wide:w-[170px] max-tablet:hidden"
          }
          aria-hidden='true'
        >
          <div
            className={
              "mini-calendar w-30 h-[135px] bg-[#f9fcf8] border border-solid border-[#d3e3d6] shadow-[0_7px_18px_#75937c14] rounded-[12px] -rotate-[8deg] flex flex-col items-center justify-center text-[#677c68] relative"
            }
          >
            <div
              className={
                "calendar-top h-5 border-b border-solid border-b-[#dde7db] absolute top-0 w-full flex justify-around [&_span]:h-[11px] [&_span]:w-1 [&_span]:bg-[#75947a] [&_span]:-mt-1 [&_span]:rounded-[3px]"
              }
            >
              <span />
              <span />
            </div>
            <CalendarDays size={46} />
            <div
              className={
                "calendar-lines flex mt-[10px] gap-[7px] [&_i]:h-[5px] [&_i]:w-[17px] [&_i]:bg-[#e4ecdf] [&_i]:rounded-[2px]"
              }
            >
              <i />
              <i />
              <i />
            </div>
            <span
              className={
                "calendar-check absolute right-[-14px] bottom-[18px] border-[5px] border-solid border-[#e9f2ed] bg-[#88a97b] text-white w-[43px] h-[43px] rounded-full grid place-items-center"
              }
            >
              <CheckCheck size={22} />
            </span>
          </div>
          <div
            className={
              "floating-label absolute right-0 bottom-1 bg-[#f8fbf5] border border-solid border-[#dce6d6] rounded-[6px] flex items-center text-[10px] text-[#6b7b61] rotate-[2deg] px-[10px] py-[7px] gap-[6px]"
            }
          >
            <CheckCheck size={16} />
            Organized. Connected. Clear.
          </div>
        </div>
      </section>
      <div
        className={
          "stats-grid grid grid-cols-[repeat(4,_minmax(0,_1fr))] mb-[25px] gap-[18px] max-wide:gap-3 max-tablet:grid-cols-[repeat(2,_minmax(0,_1fr))] max-mobile:gap-3"
        }
      >
        <Stat
          label={student ? "Enrolled courses" : "Courses"}
          value={courses?.length || 0}
          detail={
            user.role === "HOD" ? user.department : "Current academic records"
          }
          icon={<BookOpen size={19} />}
        />
        <Stat
          label='Upcoming examinations'
          value={upcoming.length}
          detail='Published schedules'
          icon={<CalendarDays size={19} />}
        />
        <Stat
          label='Published results'
          value={
            student
              ? ownResults?.filter((r) => r.status === "PUBLISHED").length || 0
              : published.length
          }
          detail={
            student
              ? "Your published examination results"
              : "Available to students"
          }
          icon={<CheckCheck size={19} />}
        />
        <Stat
          label='Awaiting publication'
          value={pending.length}
          detail='Across scheduled examinations'
          icon={<Clock size={19} />}
        />
      </div>
      <ErrorMessage message={ownResultsError} />
      <div
        className={
          "dashboard-grid grid grid-cols-[1.55fr_1fr] gap-[22px] [&_.panel]:min-w-0 max-wide:grid-cols-[1.3fr_1fr] max-wide:gap-4 max-tablet:grid-cols-[1fr]"
        }
      >
        <Panel
          title='Upcoming examinations'
          subtitle='Plan ahead with the latest published schedules'
          action={<LinkButton to='schedule'>View all</LinkButton>}
        >
          {upcoming.length ? (
            <div
              className={
                "exam-list px-[22px] py-0 max-mobile:px-[18px] max-mobile:py-0"
              }
            >
              {upcoming.slice(0, 4).map((e) => (
                <div
                  className={
                    "exam-list-row flex items-center border-b border-solid border-b-[#edf1ed] px-0 py-[18px] gap-[14px] [&:last-child]:border-0 cinema:px-0 cinema:py-[23px]"
                  }
                  key={e.id}
                >
                  <div
                    className={
                      "date-tile border border-solid border-[#e3e9e0] bg-[#f6f8f2] rounded-[7px] text-center min-w-[43px] h-[49px] flex flex-col justify-center [&_strong]:text-[17px] [&_strong]:leading-[1.1] [&_strong]:text-[#657d59] [&_strong]:font-semibold [&_span]:text-[11px] [&_span]:text-[#6f7968] [&_span]:mt-[3px] [&_span]:uppercase"
                    }
                  >
                    <strong>{e.date.slice(-2)}</strong>
                    <span>
                      {new Date(`${e.date}T00:00:00`).toLocaleDateString("en", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div
                    className={
                      "exam-list-detail flex-1 [&_h3]:text-[13px] [&_h3]:text-[#3b5645] [&_h3]:mt-[2px] [&_p]:text-[11px] [&_p]:text-[#707873] [&_p]:mt-1 [&_p_span]:mx-1 [&_p_span]:my-0 max-mobile:[&_h3]:text-[13px]"
                    }
                  >
                    <span
                      className={
                        "course-code text-[11px] text-[#5f7e69] tracking-[0.3px] font-semibold"
                      }
                    >
                      {e.code}
                    </span>
                    <h3>{e.title}</h3>
                    <p>
                      {e.exam_type} <span>·</span> {e.start_time}–{e.end_time}{" "}
                      IST
                    </p>
                  </div>
                  <div
                    className={
                      "exam-location text-[#70796b] text-[11px] flex items-center gap-1 max-wide:hidden"
                    }
                  >
                    <MapPin size={14} />
                    {e.venue}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title='No upcoming examinations'
              description='Published examinations will appear here.'
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
            <div
              className={
                "course-mini-list px-[22px] py-[10px] [&_>_div]:flex [&_>_div]:border-b [&_>_div]:border-solid [&_>_div]:border-b-[#edf0ed] [&_>_div]:items-center [&_>_div]:px-0 [&_>_div]:py-[13px] [&_>_div]:gap-[11px] [&_>_div:last-child]:border-0 [&_strong]:text-[13px] [&_p]:text-[12px] [&_p]:text-[#6f796a] [&_p]:mt-[3px]"
              }
            >
              {courses?.map((c) => (
                <div key={c.id}>
                  <div
                    className={
                      "course-icon bg-[#eff5ee] text-[#6a7c61] rounded-[7px] p-[9px]"
                    }
                  >
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
            <div
              className={
                "progress-list p-6 [&_>_div]:mb-6 [&_>_div:last-child]:mb-0"
              }
            >
              {reports
                ?.filter((r) => r.registered > 0)
                .slice(0, 4)
                .map((r) => (
                  <div key={r.exam.id}>
                    <div
                      className={
                        "progress-label flex items-center justify-between text-[13px] text-[#44634d] [&_strong]:font-semibold [&_small]:block [&_small]:text-[11px] [&_small]:text-[#71796b] [&_small]:font-normal [&_small]:mt-1 [&_span]:text-[13px] [&_span]:text-[#667c66]"
                      }
                    >
                      <strong>
                        {r.exam.code}
                        <small>{r.exam.exam_type}</small>
                      </strong>
                      <span>
                        {r.statistics.count}/{r.registered}
                      </span>
                    </div>
                    <div
                      className={
                        "progress-track h-[7px] bg-[#eff3ed] rounded-[5px] overflow-hidden mt-[10px] [&_i]:h-full [&_i]:bg-[#8fab7c] [&_i]:block [&_i]:rounded-[5px]"
                      }
                    >
                      <i
                        className='w-[var(--progress)]'
                        style={
                          {
                            "--progress": `${r.registered ? (r.statistics.count / r.registered) * 100 : 0}%`,
                          } as CSSProperties
                        }
                      />
                    </div>
                    <div
                      className={
                        "progress-caption text-[11px] text-[#71786c] mt-[7px]"
                      }
                    >
                      {r.exam.results_published
                        ? "Results published"
                        : r.statistics.count === r.registered
                          ? "Marks complete · ready for grading"
                          : "Evaluation in progress"}
                    </div>
                  </div>
                ))}
              {!reports?.some((r) => r.registered > 0) && (
                <Empty title='Evaluation has not started' />
              )}
            </div>
          )}
        </Panel>
      </div>
      <Panel
        title='Your next steps'
        subtitle='Continue the examination workflow'
      >
        <div
          className={
            "quick-actions grid grid-cols-[repeat(3,_minmax(0,_1fr))] p-[22px] gap-[18px] max-wide:p-[17px] max-wide:gap-[10px] max-tablet:grid-cols-[1fr]"
          }
        >
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
              <a
                href={`#${to}`}
                className={
                  "quick-action border border-solid border-[#e7ece7] rounded-[8px] flex items-center px-[14px] py-[17px] gap-3 [&:hover]:bg-[#f6faf7] [&:hover]:border-[#c5d8c9] [&_>_span]:bg-[#f0f5ee] [&_>_span]:grid [&_>_span]:place-items-center [&_>_span]:text-[#6a7c5e] [&_>_span]:rounded-[8px] [&_>_span]:p-[9px] [&_>_div]:flex-1 [&_h3]:text-[12px] [&_h3]:text-[#526c52] [&_p]:text-[10px] [&_p]:text-[#707969] [&_p]:mt-[5px] [&_>_svg]:text-[#71796c] cinema:[&_h3]:text-[14px] cinema:[&_p]:text-[12px] max-wide:px-[10px] max-wide:py-[13px] max-wide:gap-2 max-wide:[&_>_span]:hidden max-tablet:[&_>_span]:grid max-tablet:[&_h3]:text-[14px] max-tablet:[&_p]:text-[12px]"
                }
                key={String(title)}
              >
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
    [edit, setEdit] = useState<Course | null | undefined>(),
    [removing, setRemoving] = useState<Course | null>(null);
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
      options: faculty
        ?.filter(
          (f) =>
            f.id === edit?.faculty_id ||
            (f.active && f.account_role === "FACULTY"),
        )
        .map((f) => ({ value: f.id, label: f.name || f.id })),
    },
    { name: "active", label: "Course is active", type: "checkbox" },
  ];
  return (
    <>
      <Heading
        title='Courses'
        description={
          admin
            ? "Maintain your course catalogue and faculty assignments."
            : "Your course catalogue and assigned faculty."
        }
        action={
          admin && (
            <button
              className={
                "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden"
              }
              onClick={() => setEdit(null)}
            >
              <Plus size={18} />
              Add course
            </button>
          )
        }
      />
      <Panel>
        <div
          className={
            "toolbar flex justify-between items-center flex-wrap px-[22px] py-[18px] gap-4 [&_>_select]:text-[14px] max-mobile:p-4 max-mobile:gap-[10px] max-mobile:[&_>_.muted]:hidden print:hidden"
          }
        >
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder='Search code, title or department…'
          />
          <span className={"muted text-muted text-[14px]"}>
            {data?.length || 0} courses
          </span>
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
                    <span
                      className={
                        "course-code text-[11px] text-[#5f7e69] tracking-[0.3px] font-semibold"
                      }
                    >
                      {c.code}
                    </span>
                    <strong className={"cell-title block mt-[3px] text-[14px]"}>
                      {c.title}
                    </strong>
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
                        className={
                          "border-0 bg-[none] text-brand text-[14px] font-semibold inline-flex items-center px-0 py-1 gap-1 [&:hover]:underline"
                        }
                        onClick={() => setEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="ml-4 text-red-700 font-semibold"
                        onClick={() => setRemoving(c)}
                      >
                        Delete course
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </Table>
        ) : (
          <Empty title='No courses yet' />
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
      {removing && (
        <Confirm
          title="Delete course"
          message={`Permanently delete ${removing.code}? Only courses without enrollments or examinations can be deleted. For a course with history, use Edit to deactivate it after resolving upcoming examinations.`}
          reasonRequired
          onClose={() => setRemoving(null)}
          onConfirm={async (reason) => {
            await api(`/courses/${removing.id}`, "DELETE", { reason });
            refresh();
            notify("Course deleted.");
          }}
        />
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
      disabled: !!edit && (edit.registered_count || 0) > 0,
      options: courses
        ?.filter((c) => c.active || c.id === edit?.course_id)
        .map((c) => ({ value: c.id, label: `${c.code} · ${c.title}` })),
    },
    {
      name: "exam_type",
      label: "Examination type",
      disabled: !!edit && (edit.registered_count || 0) > 0,
    },
    {
      name: "date",
      label: "Date",
      type: "date",
      disabled:
        !!edit &&
        new Date(`${edit.date}T${edit.start_time}:00+05:30`).getTime() <=
          Date.now(),
    },
    { name: "venue", label: "Venue" },
    {
      name: "start_time",
      label: "Start time (IST)",
      type: "time",
      disabled:
        !!edit &&
        new Date(`${edit.date}T${edit.start_time}:00+05:30`).getTime() <=
          Date.now(),
    },
    {
      name: "end_time",
      label: "End time (IST)",
      type: "time",
      disabled:
        !!edit &&
        new Date(`${edit.date}T${edit.start_time}:00+05:30`).getTime() <=
          Date.now(),
    },
    {
      name: "max_marks",
      label: "Maximum marks",
      disabled: !!edit && (edit.marked_count || 0) > 0,
      type: "number",
      min: 1,
      max: 10000,
      step: "any",
    },
    {
      name: "status",
      label: "Schedule status",
      type: "select",
      options: ((edit?.marked_count || 0) > 0
        ? ["PUBLISHED"]
        : (edit?.registered_count || 0) > 0
          ? ["PUBLISHED", "CANCELLED"]
          : edit
            ? ["DRAFT", "PUBLISHED", "CANCELLED"]
            : ["DRAFT", "PUBLISHED"]
      ).map((v) => ({
        value: v,
        label: v,
      })),
    },
  ];
  return (
    <>
      <Heading
        title='Exam schedules'
        description='Examination dates, times and venues. All times are in IST.'
        action={
          admin && (
            <button
              className={
                "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden"
              }
              onClick={() => setEdit(null)}
            >
              <Plus size={18} />
              Create examination
            </button>
          )
        }
      />
      <Panel>
        <div
          className={
            "toolbar flex justify-between items-center flex-wrap px-[22px] py-[18px] gap-4 [&_>_select]:text-[14px] max-mobile:p-4 max-mobile:gap-[10px] max-mobile:[&_>_.muted]:hidden print:hidden"
          }
        >
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder='Search course or venue…'
          />
          <select
            aria-label='Filter schedule status'
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value=''>All statuses</option>
            {(user.role === "STUDENT"
              ? ["PUBLISHED", "CANCELLED"]
              : ["DRAFT", "PUBLISHED", "CANCELLED"]
            ).map((s) => (
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
                    <span
                      className={
                        "course-code text-[11px] text-[#5f7e69] tracking-[0.3px] font-semibold"
                      }
                    >
                      {e.code}
                    </span>
                    <strong className={"cell-title block mt-[3px] text-[14px]"}>
                      {e.title}
                    </strong>
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
                        className={
                          "border-0 bg-[none] text-brand text-[14px] font-semibold inline-flex items-center px-0 py-1 gap-1 [&:hover]:underline"
                        }
                        disabled={
                          e.status === "CANCELLED" || !!e.results_published
                        }
                        title={
                          e.status === "CANCELLED"
                            ? "Cancelled examinations are closed"
                            : e.results_published
                              ? "Withdraw results before editing"
                              : "Edit this schedule"
                        }
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
            title='No examination schedules'
            description='Published schedules for your courses will appear here.'
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
              if (
                v.status !== edit?.status &&
                (v.status === "PUBLISHED" || v.status === "CANCELLED")
              ) {
                const message =
                  v.status === "CANCELLED"
                    ? "Cancel this examination and all its active registrations? This schedule cannot be reopened."
                    : "Publish this examination schedule and open registration for eligible students?";
                if (!window.confirm(message))
                  throw new Error("Schedule changes were not saved.");
              }
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
    {
      data: eligible,
      error: eligibleError,
      loading: eligibleLoading,
    } = useData<Exam[]>(
      student ? "/registrations/eligible-exams" : "/exams",
      version,
    ),
    { data: students, error: studentsError } = useData<Student[]>(
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
        title='Examination registrations'
        description={
          student
            ? "Register for eligible examinations and keep your receipts in one place."
            : "Review student registrations and register enrolled students for examinations."
        }
        action={
          !student && (
            <button
              className={
                "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden"
              }
              onClick={() => setAdding(true)}
            >
              <Plus size={18} />
              Register student
            </button>
          )
        }
      />
      {student && (
        <div
          className={
            "info-strip border border-solid border-[#d8e7e2] bg-[#edf6f2] rounded-[8px] flex items-center text-[#426955] mb-[22px] text-[14px] px-[18px] py-[14px] gap-3"
          }
        >
          Registrations are official examination records. Contact the
          examination office if a registration needs to be cancelled or
          restored.
        </div>
      )}
      <ErrorMessage message={eligibleError || studentsError} />
      {student && (
        <>
          <div
            className={
              "section-title flex justify-between items-center mt-6 mb-4 mx-0 [&_h2]:text-[16px] [&_span]:text-[13px] [&_span]:text-[#6e7a6a] max-mobile:items-start max-mobile:gap-[10px] max-mobile:[&_span]:text-[11px] max-mobile:[&_h2]:text-[14px]"
            }
          >
            <h2>Available examinations</h2>
            <span>For your enrolled courses</span>
          </div>
          {eligibleLoading && <Loading />}
          <div
            className={
              "exam-card-grid grid grid-cols-[repeat(3,_minmax(0,_1fr))] mb-[26px] gap-[18px] max-wide:grid-cols-[repeat(2,_minmax(0,_1fr))] max-mobile:grid-cols-[1fr]"
            }
          >
            {eligible?.map((e) => (
              <article
                className={
                  "exam-card bg-white border border-solid border-line rounded-[9px] p-[22px] [&_h3]:text-[15px] [&_h3]:leading-[1.5] [&_>_p]:text-[13px] [&_>_p]:text-[#70796b] [&_>_p]:mt-[5px] [&_>_.button]:w-full [&_>_.button]:text-[13px]"
                }
                key={e.id}
              >
                <div
                  className={
                    "exam-card-top flex items-center justify-between mb-[14px]"
                  }
                >
                  <span
                    className={
                      "course-code text-[11px] text-[#5f7e69] tracking-[0.3px] font-semibold"
                    }
                  >
                    {e.code}
                  </span>
                  <Badge
                    value={
                      e.registration_status === "REGISTERED"
                        ? "REGISTERED"
                        : e.registration_status === "CANCELLED"
                          ? "CANCELLED"
                          : "Eligible"
                    }
                  />
                </div>
                <h3>{e.title}</h3>
                <p>
                  {e.exam_type} · {e.max_marks} marks
                </p>
                <div
                  className={
                    "exam-meta flex flex-col text-[#6c7b62] text-[13px] my-5 gap-[10px] [&_span]:flex [&_span]:items-center [&_span]:gap-2"
                  }
                >
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
                  className={cn(
                    `button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden ${e.registration_status === "REGISTERED" ? "secondary" : ""}`,
                  )}
                  disabled={
                    e.registration_status === "REGISTERED" ||
                    e.registration_status === "CANCELLED"
                  }
                  onClick={() => setRegister(e)}
                >
                  {e.registration_status === "REGISTERED"
                    ? "Registered"
                    : e.registration_status === "CANCELLED"
                      ? "Contact examination office"
                      : "Register for examination"}
                  {!e.registration_status && <ArrowRight size={16} />}
                </button>
              </article>
            ))}
          </div>
          {eligible?.length === 0 && (
            <Panel>
              <Empty
                title='No examinations available for registration'
                description='Upcoming published examinations for your enrolled courses will appear here.'
              />
            </Panel>
          )}
        </>
      )}
      <Panel
        title={student ? "My registrations" : "Registration records"}
        subtitle='Current status and examination receipts'
      >
        <div
          className={
            "toolbar flex justify-between items-center flex-wrap px-[22px] py-[18px] gap-4 [&_>_select]:text-[14px] max-mobile:p-4 max-mobile:gap-[10px] max-mobile:[&_>_.muted]:hidden print:hidden"
          }
        >
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder='Search registrations…'
          />
          <span className={"muted text-muted text-[14px]"}>
            {data?.length || 0} records
          </span>
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
                    <span
                      className={
                        "course-code text-[11px] text-[#5f7e69] tracking-[0.3px] font-semibold"
                      }
                    >
                      {r.code}
                    </span>
                    <strong className={"cell-title block mt-[3px] text-[14px]"}>
                      {r.title}
                    </strong>
                    <small>{r.exam_type}</small>
                  </td>
                  <td>
                    {dateLabel(r.date)}
                    <small>{r.venue}</small>
                    {r.exam_status === "CANCELLED" && (
                      <Badge value='CANCELLED' />
                    )}
                  </td>
                  <td>
                    <Badge value={r.status} />
                    <small>Seat {r.seat}</small>
                  </td>
                  <td>
                    <div
                      className={
                        "row-actions flex items-center flex-wrap gap-[14px]"
                      }
                    >
                      <button
                        className={
                          "border-0 bg-[none] text-brand text-[14px] font-semibold inline-flex items-center px-0 py-1 gap-1 [&:hover]:underline"
                        }
                        onClick={() => setReceipt(r)}
                      >
                        View receipt
                      </button>
                      {!student &&
                        r.status === "REGISTERED" &&
                        r.exam_status === "PUBLISHED" &&
                        new Date(
                          `${r.date}T${r.start_time}:00+05:30`,
                        ).getTime() > Date.now() && (
                          <button
                            className={
                              "border-0 bg-[none] text-[14px] font-semibold inline-flex items-center px-0 py-1 gap-1 [&:hover]:underline danger text-[#b34d4d]"
                            }
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
          <Empty title='No registrations yet' />
        )}
      </Panel>
      {register && (
        <Confirm
          title='Confirm examination registration'
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
          title='Cancel registration'
          message={`Cancel ${cancel.name}'s registration for ${cancel.code} ${cancel.exam_type}? The reason and your identity will be recorded. Only the examination office can restore it.`}
          reasonRequired
          onClose={() => setCancel(null)}
          onConfirm={async (reason) => {
            await api(`/registrations/${cancel.id}`, "DELETE", { reason });
            refresh();
            notify("Registration cancelled.");
          }}
        />
      )}
      {receipt && (
        <Modal title='Registration receipt' onClose={() => setReceipt(null)}>
          <div
            className={
              "receipt text-center [&_h3]:text-[19px] [&_h3]:mt-[17px] [&_>_p]:text-[#6e7a66] [&_>_p]:text-[14px] [&_>_p]:mt-[5px] [&_dl]:mt-[23px] [&_dl]:mb-0 [&_dl]:text-left [&_dl]:mx-0 [&_dl_>_div]:grid [&_dl_>_div]:grid-cols-[135px_1fr] [&_dl_>_div]:border-b [&_dl_>_div]:border-solid [&_dl_>_div]:border-b-[#edf0e9] [&_dl_>_div]:text-[13px] [&_dl_>_div]:px-0 [&_dl_>_div]:py-[10px] [&_dt]:text-[#707968] [&_dd]:text-[#526c49] [&_dd]:wrap-anywhere [&_dd]:m-0 max-mobile:[&_dl_>_div]:grid-cols-[110px_1fr]"
            }
          >
            <div
              className={
                "receipt-brand flex justify-center items-center text-brand text-[23px] mt-[10px] mb-[18px] mx-0 gap-[10px]"
              }
            >
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
          <div
            className={
              "modal-actions flex justify-end mt-[25px] pt-[18px] border-t border-solid border-t-line gap-3 print:[dialog_&]:hidden"
            }
          >
            <button
              className={
                "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden secondary"
              }
              onClick={() => window.print()}
            >
              <Printer size={16} />
              Print slip
            </button>
            <button
              className={
                "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden"
              }
              onClick={() => setReceipt(null)}
            >
              Done
            </button>
          </div>
        </Modal>
      )}
      {adding && (
        <Modal title='Register student' onClose={() => setAdding(false)}>
          <RecordForm
            fields={[
              {
                name: "studentId",
                label: "Student",
                type: "select",
                options: students
                  ?.filter((s) => s.active && s.account_role === "STUDENT")
                  .map((s) => ({
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
            <span
              className={
                "course-code text-[11px] text-[#5f7e69] tracking-[0.3px] font-semibold"
              }
            >
              {r.code}
            </span>
            <strong className={"cell-title block mt-[3px] text-[14px]"}>
              {r.title}
            </strong>
            <small>
              {r.exam_type} · {dateLabel(r.date)}
            </small>
          </td>
          <td>
            {r.status === "PUBLISHED" ? (
              <>
                <strong>{r.marks_obtained}</strong>
                <span className={"muted text-muted text-[14px]"}>
                  {" "}
                  / {r.max_marks}
                </span>
              </>
            ) : (
              "—"
            )}
          </td>
          <td>
            {r.grade ? (
              <span
                className={cn(
                  `grade inline-grid place-items-center bg-[#edf5e7] text-[#657f4b] rounded-[7px] min-w-[39px] h-[38px] text-[16px] font-semibold [&.fail]:bg-[#f8eeeb] [&.fail]:text-[#956f64] [&.small]:text-[14px] [&.small]:h-[25px] [&.small]:min-w-[29px] ${r.grade === "F" ? "fail" : ""}`,
                )}
              >
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
      title='No result records'
      description='Results appear here after examination registration.'
    />
  );
}
export function Results() {
  const { version } = useApp(),
    { data, error, loading } = useData<ResultRow[]>("/results", version);
  return (
    <>
      <Heading
        title='My results'
        description='Your marks and grades become visible after official publication.'
      />
      <Panel
        title='Examination results'
        subtitle='Only your own published marks and grades are shown'
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
  const {
    data: studentRows,
    error: studentError,
    loading: studentLoading,
  } = useData<ResultRow[]>(
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
        title='Reports & analytics'
        description={
          user.role === "HOD"
            ? `Read-only examination performance for ${user.department}.`
            : "Review class performance, grade distributions and published pass/fail statistics."
        }
        action={
          <button
            className={
              "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden secondary"
            }
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
          <div
            className={
              "toolbar flex items-center flex-wrap px-[22px] py-[18px] [&_>_select]:text-[14px] max-mobile:p-4 max-mobile:gap-[10px] max-mobile:[&_>_.muted]:hidden print:hidden report-filters bg-white border border-solid border-line rounded-[9px] mb-[22px] justify-start gap-[22px] [&_label]:flex [&_label]:flex-col [&_label]:text-[12px] [&_label]:text-[#6e7a65] [&_label]:min-w-[230px] [&_label]:gap-[6px] [&_select]:text-[14px] max-mobile:[&_label]:w-full max-mobile:[&_label]:min-w-0"
            }
          >
            <label>
              Department
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setExamId("");
                }}
              >
                <option value=''>All accessible departments</option>
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
              <div
                className={
                  "stats-grid grid grid-cols-[repeat(4,_minmax(0,_1fr))] mb-[25px] gap-[18px] max-wide:gap-3 max-tablet:grid-cols-[repeat(2,_minmax(0,_1fr))] max-mobile:gap-3"
                }
              >
                <Stat
                  label='Class mean'
                  value={selected.statistics.mean ?? "—"}
                  detail={`Out of ${selected.exam.max_marks} marks`}
                />
                <Stat
                  label='Median'
                  value={selected.statistics.median ?? "—"}
                  detail={`${selected.statistics.count} evaluated students`}
                />
                <Stat
                  label='Standard deviation'
                  value={selected.statistics.std_dev ?? "—"}
                  detail='Population standard deviation'
                />
                <Stat
                  label='Published pass rate'
                  value={
                    selected.passRate === null ? "—" : `${selected.passRate}%`
                  }
                  detail={`${selected.passed} passed · ${selected.failed} failed`}
                />
              </div>
              <div
                className={
                  "dashboard-grid grid grid-cols-[1.55fr_1fr] gap-[22px] [&_.panel]:min-w-0 max-wide:grid-cols-[1.3fr_1fr] max-wide:gap-4 max-tablet:grid-cols-[1fr]"
                }
              >
                <Panel
                  title='Grade distribution'
                  subtitle='Based on published results only'
                >
                  <div
                    className={
                      "distribution p-[26px] [&_>_div]:flex [&_>_div]:items-center [&_>_div]:mb-[18px] [&_>_div]:text-[13px] [&_>_div]:gap-[13px] [&_.progress-track]:flex-1 [&_.progress-track]:h-[17px] [&_.progress-track]:rounded-[3px] [&_.progress-track]:m-0 [&_.progress-track_i]:rounded-[3px] [&_>_div_>_span:last-child]:text-[11px] [&_>_div_>_span:last-child]:text-[#717967]"
                    }
                  >
                    {selected.distribution.length ? (
                      selected.distribution.map((d) => (
                        <div key={d.grade}>
                          <span
                            className={
                              "distribution-grade w-[25px] font-semibold"
                            }
                          >
                            {d.grade}
                          </span>
                          <div
                            className={
                              "progress-track h-[7px] bg-[#eff3ed] rounded-[5px] overflow-hidden mt-[10px] [&_i]:h-full [&_i]:bg-[#8fab7c] [&_i]:block [&_i]:rounded-[5px]"
                            }
                          >
                            <i
                              className='w-[var(--progress)]'
                              style={
                                {
                                  "--progress": `${(d.count / Math.max(...selected.distribution.map((x) => x.count))) * 100}%`,
                                } as CSSProperties
                              }
                            />
                          </div>
                          <strong>{d.count}</strong>
                          <span>students</span>
                        </div>
                      ))
                    ) : (
                      <Empty
                        title='Results are not published yet'
                        description='The distribution appears after official publication.'
                      />
                    )}
                  </div>
                </Panel>
                <Panel
                  title='Examination summary'
                  subtitle={`${selected.exam.code} · ${selected.exam.exam_type}`}
                >
                  <dl
                    className={
                      "summary-list px-[22px] py-[6px] m-0 [&_>_div]:flex [&_>_div]:justify-between [&_>_div]:border-b [&_>_div]:border-solid [&_>_div]:border-b-[#eef1e9] [&_>_div]:text-[13px] [&_>_div]:px-0 [&_>_div]:py-[13px] [&_>_div:last-child]:border-0 [&_dt]:text-[#707966] [&_dd]:text-[#6b8157] [&_dd]:font-semibold [&_dd]:m-0"
                    }
                  >
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
              <Empty title='No examination reports yet' />
            </Panel>
          )}
          <Panel
            title='Course performance'
            subtitle='F is the failing grade; other configured grades count as passing'
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
          title='Student-wise report'
          subtitle='Published marks and grades across registered courses'
        >
          <div
            className={
              "toolbar flex justify-between items-center flex-wrap px-[22px] py-[18px] gap-4 [&_>_select]:text-[14px] max-mobile:p-4 max-mobile:gap-[10px] max-mobile:[&_>_.muted]:hidden print:hidden"
            }
          >
            <select
              aria-label='Select student for report'
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value=''>Choose a student…</option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.roll_no} · {s.name}
                </option>
              ))}
            </select>
          </div>
          <ErrorMessage message={studentError} />
          {studentId &&
            (studentLoading ? (
              <Loading />
            ) : (
              !studentError && <ResultTable rows={studentRows || []} />
            ))}
        </Panel>
      )}
    </>
  );
}
