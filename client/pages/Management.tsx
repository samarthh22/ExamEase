import { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { api, useData } from "../api";
import {
  Badge,
  Empty,
  ErrorMessage,
  Heading,
  Loading,
  Modal,
  Panel,
  RecordForm,
  SearchBox,
  Table,
  roleLabels,
  useApp,
  type Field,
  type FormValues,
} from "../ui";
import type { User, Student, Faculty, Course } from "../../shared/types";
type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
  name: string;
  roll_no: string;
  code: string;
  title: string;
};
type ProfileAccount = Pick<User, "id" | "name" | "email" | "role" | "active">;
export function Records() {
  const { user, version, refresh, notify } = useApp(),
    [tab, setTab] = useState<"students" | "faculty" | "enrollments">(
      "students",
    ),
    [search, setSearch] = useState(""),
    [edit, setEdit] = useState<Student | Faculty | null | undefined>(),
    [enroll, setEnroll] = useState(false);
  const students = useData<Student[]>("/students", version),
    faculty = useData<Faculty[]>("/faculty", version),
    enrollments = useData<Enrollment[]>("/enrollments", version),
    accounts = useData<ProfileAccount[]>("/profile-accounts", version),
    courses = useData<Course[]>("/courses", version);
  const selected = tab === "students" ? students : faculty;
  const fields: Field[] = [
    {
      name: "user_id",
      label: "Linked user account",
      type: "select",
      disabled: !!edit,
      options: edit
        ? [{ value: edit.user_id, label: `${edit.name} · ${edit.email}` }]
        : accounts.data
            ?.filter(
              (u) =>
                u.role === (tab === "students" ? "STUDENT" : "FACULTY") &&
                u.active &&
                !(tab === "students" ? students.data : faculty.data)?.some(
                  (profile) => profile.user_id === u.id,
                ),
            )
            .map((u) => ({ value: u.id, label: `${u.name} · ${u.email}` })),
      hint: "Accounts are created by the system administrator.",
    },
    ...(tab === "students"
      ? [
          { name: "roll_no", label: "Unique roll number" },
          {
            name: "batch_year",
            label: "Batch year",
            type: "number" as const,
            min: 2000,
            max: 2100,
          },
        ]
      : []),
    { name: "department", label: "Department" },
  ];
  return (
    <>
      <Heading
        title="Students & faculty"
        description="Maintain academic profiles and student course enrollments."
        action={
          <button
            className="button"
            onClick={() =>
              tab === "enrollments" ? setEnroll(true) : setEdit(null)
            }
          >
            <Plus size={17} />
            {tab === "enrollments"
              ? "Enroll student"
              : tab === "students"
                ? "Add student"
                : "Add faculty"}
          </button>
        }
      />
      <div className="tabs" role="tablist" aria-label="Academic records">
        {(["students", "faculty", "enrollments"] as const).map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? "active" : ""}
            key={t}
            onClick={() => {
              setTab(t);
              setSearch("");
            }}
          >
            {t === "students"
              ? "Students"
              : t === "faculty"
                ? "Faculty"
                : "Course enrollments"}
          </button>
        ))}
      </div>
      <Panel>
        <div className="toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search name, roll number or department…"
          />
        </div>
        <ErrorMessage
          message={selected.error || enrollments.error || accounts.error}
        />
        {(tab === "enrollments" ? enrollments.loading : selected.loading) ? (
          <Loading />
        ) : tab === "enrollments" ? (
          enrollments.data?.length ? (
            <Table headers={["Student", "Roll number", "Course"]}>
              {enrollments.data
                .filter((r) =>
                  `${r.name} ${r.roll_no} ${r.code}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.name}</strong>
                    </td>
                    <td>{r.roll_no}</td>
                    <td>
                      <span className="course-code">{r.code}</span>
                      <strong className="cell-title">{r.title}</strong>
                    </td>
                  </tr>
                ))}
            </Table>
          ) : (
            <Empty title="No enrollments yet" />
          )
        ) : selected.data?.length ? (
          <Table
            headers={[
              "Name / email",
              ...(tab === "students" ? ["Roll number / batch"] : []),
              "Department",
              "Actions",
            ]}
          >
            {selected.data
              .filter((r) =>
                `${r.name} ${r.department} ${"roll_no" in r ? r.roll_no : ""}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                    <small>{r.email}</small>
                  </td>
                  {tab === "students" && (
                    <td>
                      {(r as Student).roll_no}
                      <small>Batch {(r as Student).batch_year}</small>
                    </td>
                  )}
                  <td>{r.department}</td>
                  <td>
                    <button className="text-button" onClick={() => setEdit(r)}>
                      Edit record
                    </button>
                  </td>
                </tr>
              ))}
          </Table>
        ) : (
          <Empty title={`No ${tab} records yet`} />
        )}
      </Panel>
      {edit !== undefined && (
        <Modal
          title={`${edit ? "Edit" : "Add"} ${tab === "students" ? "student" : "faculty"} record`}
          onClose={() => setEdit(undefined)}
        >
          <RecordForm
            fields={fields}
            initial={
              edit
                ? (Object.fromEntries(
                    fields.map((f) => [
                      f.name,
                      edit[f.name as keyof typeof edit],
                    ]),
                  ) as FormValues)
                : { department: user.department, batch_year: 2024 }
            }
            onClose={() => setEdit(undefined)}
            onSave={async (v) => {
              const payload = Object.fromEntries(
                fields.map((f) => [f.name, v[f.name]]),
              );
              await api(
                `/${tab}${edit ? `/${edit.id}` : ""}`,
                edit ? "PUT" : "POST",
                payload,
              );
              refresh();
              notify("Academic record saved.");
            }}
          />
        </Modal>
      )}
      {enroll && (
        <Modal
          title="Enroll student in a course"
          onClose={() => setEnroll(false)}
        >
          <RecordForm
            fields={[
              {
                name: "student_id",
                label: "Student",
                type: "select",
                options: students.data
                  ?.filter((s) => s.active && s.account_role === "STUDENT")
                  .map((s) => ({
                    value: s.id,
                    label: `${s.roll_no} · ${s.name}`,
                  })),
              },
              {
                name: "course_id",
                label: "Course",
                type: "select",
                options: courses.data
                  ?.filter((c) => c.active)
                  .map((c) => ({
                    value: c.id,
                    label: `${c.code} · ${c.title}`,
                  })),
              },
            ]}
            onClose={() => setEnroll(false)}
            onSave={async (v) => {
              await api("/enrollments", "POST", v);
              refresh();
              notify("Student enrolled in course.");
            }}
          />
        </Modal>
      )}
    </>
  );
}
export function Accounts() {
  const { user, version, refresh, notify } = useApp(),
    { data, error, loading } = useData<User[]>("/users", version),
    [search, setSearch] = useState(""),
    [edit, setEdit] = useState<User | null | undefined>();
  const fields: Field[] = [
    { name: "name", label: "Full name" },
    { name: "email", label: "Institutional email", type: "email" },
    {
      name: "role",
      label: "Assigned role",
      type: "select",
      disabled: edit?.id === user.id,
      options: Object.entries(roleLabels).map(([value, label]) => ({
        value,
        label,
      })),
    },
    { name: "department", label: "Department" },
    {
      name: "password",
      label: edit ? "New password (optional)" : "Initial password",
      type: "password",
      required: !edit,
      hint: "At least 10 characters. Existing sessions are revoked on account updates.",
    },
    {
      name: "active",
      label: "Account is active",
      type: "checkbox",
      disabled: edit?.id === user.id,
    },
  ];
  return (
    <>
      <Heading
        eyebrow="SYSTEM ADMINISTRATION"
        title="User accounts"
        description="Create institutional accounts and control role-based access."
        action={
          <button className="button" onClick={() => setEdit(null)}>
            <Plus size={17} />
            Create account
          </button>
        }
      />
      <div className="info-strip">
        <ShieldCheck size={19} />
        <span>
          Account administration is separate from examination administration.
          Student and faculty profiles are managed by the examination office.
        </span>
      </div>
      <Panel>
        <div className="toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search account, role or department…"
          />
          <span className="muted">{data?.length || 0} accounts</span>
        </div>
        <ErrorMessage message={error} />
        {loading ? (
          <Loading />
        ) : (
          <Table
            headers={["Account", "Role", "Department", "Status", "Actions"]}
          >
            {data
              ?.filter((u) =>
                `${u.name} ${u.email} ${roleLabels[u.role]} ${u.department}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                    <small>{u.email}</small>
                  </td>
                  <td>{roleLabels[u.role]}</td>
                  <td>{u.department}</td>
                  <td>
                    <Badge value={u.active ? "Active" : "Inactive"} />
                  </td>
                  <td>
                    <button className="text-button" onClick={() => setEdit(u)}>
                      Manage account
                    </button>
                  </td>
                </tr>
              ))}
          </Table>
        )}
      </Panel>
      {edit !== undefined && (
        <Modal
          title={edit ? "Manage account" : "Create user account"}
          onClose={() => setEdit(undefined)}
        >
          <RecordForm
            fields={fields}
            initial={
              edit
                ? {
                    name: edit.name,
                    email: edit.email,
                    role: edit.role,
                    department: edit.department,
                    active: !!edit.active,
                  }
                : {
                    active: true,
                    role: "STUDENT",
                    department: "Computer Science",
                  }
            }
            onClose={() => setEdit(undefined)}
            onSave={async (v) => {
              const payload = { ...v };
              if (!payload.password) delete payload.password;
              if (
                edit &&
                (v.role !== edit.role ||
                  !!v.active !== !!edit.active ||
                  payload.password)
              ) {
                if (
                  !window.confirm(
                    "Apply this account access change? Existing sessions for this account will be revoked.",
                  )
                )
                  throw new Error("Account changes were not saved.");
              }
              await api(
                `/users${edit ? `/${edit.id}` : ""}`,
                edit ? "PUT" : "POST",
                payload,
              );
              refresh();
              notify("User account saved.");
            }}
          />
        </Modal>
      )}
    </>
  );
}
export function Audit() {
  const { version } = useApp(),
    { data, error, loading } = useData<
      {
        id: string;
        action: string;
        entity_id: string;
        created_at: string;
        name: string;
      }[]
    >("/audit", version);
  return (
    <>
      <Heading
        eyebrow="SYSTEM ADMINISTRATION"
        title="Audit history"
        description="The latest 100 significant changes, with the responsible user and timestamp."
      />
      <Panel>
        <ErrorMessage message={error} />
        {loading ? (
          <Loading />
        ) : data?.length ? (
          <Table
            headers={[
              "Action",
              "Performed by",
              "Record identifier",
              "Timestamp (IST)",
            ]}
          >
            {data.map((a) => (
              <tr key={a.id}>
                <td>
                  <strong>{a.action.replaceAll("_", " ")}</strong>
                </td>
                <td>{a.name}</td>
                <td>
                  <code>{a.entity_id}</code>
                </td>
                <td>
                  {new Date(a.created_at).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <Empty title="No changes recorded yet" />
        )}
      </Panel>
    </>
  );
}
