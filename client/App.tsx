import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PenLine,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { api } from "./api";
import {
  AppContext,
  ErrorMessage,
  Loading,
  roleLabels,
  PasswordInput,
} from "./ui";
import { confirmDiscard } from "./unsaved";
import type { Role, User } from "../shared/types";
import {
  Home,
  Schedule,
  Courses,
  Registrations,
  Results,
  Reports,
} from "./pages/Academic";
import { Records, Accounts, Audit } from "./pages/Management";
import { Evaluation } from "./pages/Evaluation";
const navigation = [
  {
    id: "home",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["STUDENT", "FACULTY", "EXAM_ADMIN", "HOD"],
  },
  {
    id: "courses",
    label: "Courses",
    icon: BookOpen,
    roles: ["STUDENT", "FACULTY", "EXAM_ADMIN", "HOD"],
  },
  {
    id: "schedule",
    label: "Exam schedules",
    icon: CalendarDays,
    roles: ["STUDENT", "FACULTY", "EXAM_ADMIN", "HOD"],
  },
  {
    id: "registrations",
    label: "Registrations",
    icon: ClipboardList,
    roles: ["STUDENT", "EXAM_ADMIN"],
  },
  {
    id: "records",
    label: "Students & faculty",
    icon: Users,
    roles: ["EXAM_ADMIN"],
  },
  { id: "marks", label: "Marks & grading", icon: PenLine, roles: ["FACULTY"] },
  {
    id: "publication",
    label: "Result publication",
    icon: CheckCheck,
    roles: ["EXAM_ADMIN"],
  },
  { id: "results", label: "My results", icon: CheckCheck, roles: ["STUDENT"] },
  {
    id: "reports",
    label: "Reports & analytics",
    icon: BarChart3,
    roles: ["EXAM_ADMIN", "FACULTY", "HOD"],
  },
  { id: "accounts", label: "User accounts", icon: Users, roles: ["SYS_ADMIN"] },
  {
    id: "audit",
    label: "Audit history",
    icon: ShieldCheck,
    roles: ["SYS_ADMIN"],
  },
];
function Brand() {
  return (
    <div className="brand">
      <span className="brand-symbol">
        <GraduationCap size={26} />
      </span>
      <span>
        Exam<span className="brand-accent">Ease</span>
        <small>EXAMINATION MANAGEMENT</small>
      </span>
    </div>
  );
}
function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const result = await api<{ user: User }>("/auth/login", "POST", {
        email: form.get("email"),
        password: form.get("password"),
      });
      onLogin(result.user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <section className="login-story">
        <Brand />
        <div className="login-copy">
          <div className="eyebrow">A CLEARER WAY TO MANAGE EXAMINATIONS</div>
          <h1>
            Every examination.
            <br />
            One organized place.
          </h1>
          <p>
            From the first registration to the final result, keep your
            institution’s examination workflow connected.
          </p>
          <div className="workflow">
            <div>
              <CalendarDays />
              <span>Plan & schedule</span>
            </div>
            <i />
            <div>
              <PenLine />
              <span>Evaluate & grade</span>
            </div>
            <i />
            <div>
              <CheckCheck />
              <span>Publish results</span>
            </div>
          </div>
        </div>
        <div className="login-footer">
          ExamEase <span>Software Engineering Project · Team T021</span>
        </div>
      </section>
      <section className="login-form">
        <div className="login-box">
          <div className="login-icon">
            <ShieldCheck size={28} />
          </div>
          <h2>Welcome back</h2>
          <p>Sign in with your institutional account to continue.</p>
          <form onSubmit={submit}>
            <label className="field">
              <span>Institutional email</span>
              <input
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@institution.edu"
                required
                autoFocus
              />
            </label>
            <label className="field">
              <span>Password</span>
              <PasswordInput
                name="password"
                aria-label="Password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                maxLength={128}
                disabled={busy}
              />
            </label>
            <ErrorMessage message={error} />
            <button className="button login-submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="account-help">
            Need an account or help signing in?
            <br />
            Contact your institution’s system administrator.
          </p>
          <div className="secure-note">
            <ShieldCheck size={15} />
            Secure access for your assigned role
          </div>
        </div>
      </section>
    </div>
  );
}
export function App() {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [page, setPage] = useState(location.hash.slice(1) || "home"),
    [version, setVersion] = useState(0),
    [toast, setToast] = useState(""),
    [menu, setMenu] = useState(false);
  useEffect(() => {
    api<{ user: User }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => {})
      .finally(() => setLoading(false));
    let previousHash = location.hash;
    const hash = () => {
      if (!confirmDiscard()) {
        history.replaceState(null, "", previousHash || "#home");
        return;
      }
      previousHash = location.hash;
      setPage(location.hash.slice(1) || "home");
      setMenu(false);
    };
    const expired = () => setUser(null);
    window.addEventListener("hashchange", hash);
    window.addEventListener("session-expired", expired);
    return () => {
      window.removeEventListener("hashchange", hash);
      window.removeEventListener("session-expired", expired);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  if (loading) return <Loading />;
  if (!user)
    return (
      <Login
        onLogin={(u) => {
          setUser(u);
          location.hash = u.role === "SYS_ADMIN" ? "accounts" : "home";
        }}
      />
    );
  const nav = navigation.filter((n) => n.roles.includes(user.role)),
    active = nav.find((n) => n.id === page) || nav[0];
  const refresh = () => setVersion((v) => v + 1);
  const content = () => {
    switch (active.id) {
      case "courses":
        return <Courses />;
      case "schedule":
        return <Schedule />;
      case "registrations":
        return <Registrations />;
      case "records":
        return <Records />;
      case "marks":
      case "publication":
        return <Evaluation />;
      case "results":
        return <Results />;
      case "reports":
        return <Reports />;
      case "accounts":
        return <Accounts />;
      case "audit":
        return <Audit />;
      default:
        return <Home />;
    }
  };
  return (
    <AppContext.Provider value={{ user, version, refresh, notify: setToast }}>
      <div className="app-shell">
        {menu && (
          <button
            className="sidebar-backdrop"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          />
        )}
        <aside className={`sidebar ${menu ? "open" : ""}`}>
          <a href={`#${nav[0].id}`} className="brand-link">
            <Brand />
          </a>
          <div className="workspace-label">INSTITUTION WORKSPACE</div>
          <nav aria-label="Main navigation">
            {nav.map((n) => (
              <a
                href={`#${n.id}`}
                className={active.id === n.id ? "active" : ""}
                key={n.id}
                aria-current={active.id === n.id ? "page" : undefined}
              >
                <n.icon size={19} />
                <span>{n.label}</span>
                {active.id === n.id && <i />}
              </a>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="institution">
              <span className="institution-icon">
                <GraduationCap size={20} />
              </span>
              <div>
                ExamEase<small>Single institution workspace</small>
              </div>
            </div>
            <button
              className="logout"
              onClick={async () => {
                if (!confirmDiscard()) return;
                try {
                  await api("/auth/logout", "POST");
                  setUser(null);
                } catch (e) {
                  setToast((e as Error).message);
                }
              }}
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="icon-button mobile-menu"
                aria-label="Open navigation"
                onClick={() => setMenu(true)}
              >
                <Menu size={21} />
              </button>
              <span>Workspace</span>
              <span>/</span>
              <strong>{active.label}</strong>
            </div>
            <div className="topbar-right">
              <span className="academic-period">Academic year 2026–27</span>
              <div className="user-block">
                <div className="avatar">
                  {user.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <strong>{user.name}</strong>
                  <small>{roleLabels[user.role as Role]}</small>
                </div>
              </div>
            </div>
          </header>
          <main key={`${user.id}-${active.id}`}>
            <div className="content">{content()}</div>
            <footer className="page-footer">
              <span>ExamEase · Examination Management System</span>
              <span>Team T021 · SWE Project</span>
            </footer>
          </main>
        </div>
        {toast && (
          <div className="toast" role="status">
            <CheckCheck size={20} />
            {toast}
            <button aria-label="Dismiss message" onClick={() => setToast("")}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
