import { cn } from "./cn";
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
import { Supervision } from "./pages/Supervision";
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
  {
    id: "duties",
    label: "Exam hall duties",
    icon: ClipboardList,
    roles: ["EXAM_ADMIN", "FACULTY", "TA"],
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
    <div
      className={
        "brand flex items-center text-[24px] font-bold tracking-[-0.8px] text-[#21463a] leading-[1.05] gap-[10px] [&_small]:block [&_small]:text-[6.5px] [&_small]:tracking-[1.35px] [&_small]:font-bold [&_small]:mt-[7px] [&_small]:text-[#6d7974] max-tablet:text-[21px] max-tablet:[&_small]:text-[5.5px]"
      }
    >
      <span
        className={
          "brand-symbol w-[43px] h-[43px] rounded-[12px] bg-brand text-white grid place-items-center max-tablet:w-[35px] max-tablet:h-[35px]"
        }
      >
        <GraduationCap size={26} />
      </span>
      <span>
        Exam<span className={"brand-accent text-[#238066]"}>Ease</span>
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
    <div
      className={
        "login-page min-h-screen grid grid-cols-[1.08fr_1fr] max-mobile:flex max-mobile:flex-col max-mobile:min-h-screen"
      }
    >
      <section
        className={
          'login-story [&_>_.brand]:relative [&_>_.brand]:z-1 bg-[#e9f2eb] flex flex-col min-h-screen relative overflow-hidden px-15 py-[49px] [&:after]:content-[""] [&:after]:absolute [&:after]:w-[470px] [&:after]:h-[470px] [&:after]:border [&:after]:border-solid [&:after]:border-[#d5e4d8] [&:after]:rounded-full [&:after]:right-[-310px] [&:after]:top-[32%] [&:after]:shadow-[0_0_0_45px_#e3eee5,_0_0_0_46px_#d9e7dc] [&:after]:pointer-events-none max-tablet:p-10 max-mobile:min-h-0 max-mobile:p-[25px] max-mobile:[&:after]:w-[250px] max-mobile:[&:after]:h-[250px] max-mobile:[&:after]:right-[-170px]'
        }
      >
        <Brand />
        <div
          className={
            "login-copy relative z-1 py-[70px] mx-0 my-auto [&_.eyebrow]:text-[#647d68] [&_.eyebrow]:text-[11px] [&_h1]:text-[44px] [&_h1]:leading-[1.2] [&_h1]:tracking-[-1.6px] [&_h1]:text-[#28553c] [&_h1]:mt-[22px] [&_>_p]:text-[#6a7b68] [&_>_p]:text-[14px] [&_>_p]:leading-[1.9] [&_>_p]:max-w-[370px] [&_>_p]:mt-[23px] max-tablet:[&_h1]:text-[35px] max-tablet:[&_>_p]:text-[14px] max-mobile:pt-[30px] max-mobile:pb-[10px] max-mobile:px-0 max-mobile:[&_h1]:text-[29px] max-mobile:[&_h1]:mt-[15px] max-mobile:[&_>_p]:hidden max-mobile:[&_.eyebrow]:hidden"
          }
        >
          <div
            className={
              "eyebrow text-[11px] tracking-[1.6px] text-[#6a7a71] font-semibold mb-[10px]"
            }
          >
            A CLEARER WAY TO MANAGE EXAMINATIONS
          </div>
          <h1>
            Every examination.
            <br />
            One organized place.
          </h1>
          <p>
            From the first registration to the final result, keep your
            institution’s examination workflow connected.
          </p>
          <div
            className={
              "workflow flex items-center mt-[53px] max-w-105 gap-[15px] [&_>_div]:flex [&_>_div]:flex-col [&_>_div]:items-center [&_>_div]:text-[11px] [&_>_div]:text-[#697c61] [&_>_div]:text-center [&_>_div]:gap-[13px] [&_>_div_>_svg]:w-[43px] [&_>_div_>_svg]:h-[43px] [&_>_div_>_svg]:bg-[#f4f8ef] [&_>_div_>_svg]:border [&_>_div_>_svg]:border-solid [&_>_div_>_svg]:border-[#dfe8d5] [&_>_div_>_svg]:rounded-[10px] [&_>_div_>_svg]:text-[#6d7b5d] [&_>_div_>_svg]:p-[10px] [&_>_i]:w-8 [&_>_i]:h-[1px] [&_>_i]:bg-[#c9d9bc] [&_>_i]:mb-[25px] max-tablet:gap-[9px] max-mobile:hidden"
            }
          >
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
        <div
          className={
            "login-footer relative z-1 flex-wrap flex justify-between text-[12px] text-[#6e7a65] gap-5 [&_span]:text-[11px] [&_span]:text-[#707967] max-tablet:flex-col max-tablet:gap-[5px] max-mobile:hidden"
          }
        >
          ExamEase <span>Software Engineering Project · Team T021</span>
        </div>
      </section>
      <section
        className={
          "login-form flex items-center justify-center bg-[#fff] p-[50px] max-tablet:p-[35px] max-mobile:pt-8 max-mobile:pb-10 max-mobile:flex-1 max-mobile:px-[25px]"
        }
      >
        <div
          className={
            "login-box max-w-[350px] w-full [&_h2]:text-[29px] [&_h2]:tracking-[-0.8px] [&_h2]:text-[#34583b] [&_>_p]:text-[14px] [&_>_p]:leading-[1.8] [&_>_p]:text-[#70796a] [&_>_p]:mt-[9px] [&_form]:mt-[30px] [&_.field]:mb-[18px] [&_.field_input]:px-[14px] [&_.field_input]:py-[13px] [&_.account-help]:mt-6 [&_.account-help]:text-center [&_.account-help]:text-[12px] [&_.account-help]:leading-[1.8] max-mobile:[&_h2]:text-[25px] max-mobile:max-w-none max-mobile:[&_form]:mt-[23px]"
          }
        >
          <div
            className={
              "login-icon w-[54px] h-[54px] bg-[#eef5e9] grid place-items-center text-[#6a7d55] rounded-[12px] mb-6 max-mobile:hidden"
            }
          >
            <ShieldCheck size={28} />
          </div>
          <h2>Welcome back</h2>
          <p>Sign in with your institutional account to continue.</p>
          <form onSubmit={submit}>
            <label
              className={
                "field flex flex-col text-[14px] min-w-0 gap-[7px] [&_>_span]:font-medium [&_>_span]:text-[#60765b] [&_b]:text-[#867555] [&_b]:font-normal [&_small]:text-[#707968] [&_small]:text-[12px] [&_small]:leading-[1.5] [&_input]:text-[14px] [&_input]:w-full [&_select]:text-[14px] [&_select]:w-full"
              }
            >
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
            <label
              className={
                "field flex flex-col text-[14px] min-w-0 gap-[7px] [&_>_span]:font-medium [&_>_span]:text-[#60765b] [&_b]:text-[#867555] [&_b]:font-normal [&_small]:text-[#707968] [&_small]:text-[12px] [&_small]:leading-[1.5] [&_input]:text-[14px] [&_input]:w-full [&_select]:text-[14px] [&_select]:w-full"
              }
            >
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
            <button
              className={
                "button inline-flex items-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden login-submit w-full justify-between mt-2 px-4 py-[13px]"
              }
              disabled={busy}
            >
              {busy ? "Signing in…" : "Sign in"}
              <ArrowRight size={18} />
            </button>
          </form>
          <p className={"account-help"}>
            Need an account or help signing in?
            <br />
            Contact your institution’s system administrator.
          </p>
          <div
            className={
              "secure-note flex justify-center text-[#72786b] text-[11px] border-t border-solid border-t-line pt-[22px] mt-[30px] gap-[6px]"
            }
          >
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
          location.hash =
            u.role === "SYS_ADMIN"
              ? "accounts"
              : u.role === "TA"
                ? "duties"
                : "home";
        }}
      />
    );
  const nav = navigation.filter((n) => n.roles.includes(user.role)),
    active = nav.find((n) => n.id === page) || nav[0];
  const refresh = () => setVersion((v) => v + 1);
  const content = () => {
    switch (active.id) {
      case "duties":
        return <Supervision />;
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
      <div
        className={
          "app-shell flex min-h-screen print:[body:has(dialog[open])_&]:invisible"
        }
      >
        {menu && (
          <button
            className={
              "sidebar-backdrop max-mobile:fixed max-mobile:inset-0 max-mobile:bg-[#163f3455] max-mobile:border-0 max-mobile:z-19"
            }
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          />
        )}
        <aside
          className={cn(
            `sidebar fixed left-0 top-0 bottom-0 w-[246px] bg-white border-r border-solid border-r-line pt-[31px] pb-4 flex flex-col z-20 px-5 [&_nav]:flex [&_nav]:flex-col [&_nav]:gap-[7px] [&_nav_a]:flex [&_nav_a]:items-center [&_nav_a]:text-[#6b7974] [&_nav_a]:text-[14px] [&_nav_a]:font-medium [&_nav_a]:rounded-[7px] [&_nav_a]:relative [&_nav_a]:px-[13px] [&_nav_a]:py-3 [&_nav_a]:gap-3 [&_nav_a:hover]:bg-[#f4f8f5] [&_nav_a:hover]:text-[#286c54] [&_nav_a.active]:bg-[#e9f4ed] [&_nav_a.active]:text-[#176b4f] [&_nav_a.active]:font-[650] [&_nav_a.active_i]:w-[5px] [&_nav_a.active_i]:h-[5px] [&_nav_a.active_i]:rounded-full [&_nav_a.active_i]:bg-[#308064] [&_nav_a.active_i]:ml-auto max-wide:w-55 max-wide:px-[14px] max-tablet:w-50 max-tablet:[&_nav_a]:text-[13px] max-tablet:[&_nav_a]:gap-[9px] max-mobile:-translate-x-full max-mobile:transition-transform max-mobile:duration-200 max-mobile:ease-[ease] max-mobile:w-[250px] max-mobile:[&.open]:translate-x-0 print:hidden ${menu ? "open" : ""}`,
          )}
        >
          <a href={`#${nav[0].id}`} className={"brand-link ml-2 mb-[43px]"}>
            <Brand />
          </a>
          <div
            className={
              "workspace-label text-[11px] tracking-[1.5px] font-semibold text-[#6f7874] mt-0 mb-[15px] mx-[13px]"
            }
          >
            INSTITUTION WORKSPACE
          </div>
          <nav aria-label="Main navigation">
            {nav.map((n) => (
              <a
                href={`#${n.id}`}
                className={cn(active.id === n.id ? "active" : "")}
                key={n.id}
                aria-current={active.id === n.id ? "page" : undefined}
              >
                <n.icon size={19} />
                <span>{n.label}</span>
                {active.id === n.id && <i />}
              </a>
            ))}
          </nav>
          <div className={"sidebar-bottom mt-auto pt-9"}>
            <div
              className={
                "institution bg-[#f6f8f6] border border-solid border-[#e8ede9] rounded-[8px] flex items-center text-[13px] font-semibold px-[11px] py-[13px] gap-[10px] [&_small]:text-[11px] [&_small]:font-normal [&_small]:block [&_small]:text-[#6e7972] [&_small]:mt-[3px]"
              }
            >
              <span className={"institution-icon text-[#5b7f70]"}>
                <GraduationCap size={20} />
              </span>
              <div>
                ExamEase<small>Single institution workspace</small>
              </div>
            </div>
            <button
              className={
                "logout flex items-center mt-[18px] mb-0 border-0 bg-[none] text-[#6c7971] text-[13px] px-0 py-1 mx-[10px] gap-[11px]"
              }
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
        <div
          className={
            "main-shell ml-[246px] min-w-0 w-[calc(100%_-_246px)] max-wide:ml-55 max-wide:w-[calc(100%_-_220px)] max-tablet:ml-50 max-tablet:w-[calc(100%_-_200px)] max-mobile:w-full max-mobile:m-0 print:w-full print:m-0"
          }
        >
          <header
            className={
              "topbar h-21 border-b border-solid border-b-line flex items-center justify-between bg-[#fff] px-9 py-0 gap-[15px] max-wide:px-[25px] max-tablet:h-[74px] max-mobile:h-[70px] max-mobile:px-4 max-mobile:py-0 print:hidden"
            }
          >
            <div
              className={
                "breadcrumb flex items-center text-[13px] text-[#6e7974] gap-[15px] [&_strong]:font-medium [&_strong]:text-[#4c635a] max-mobile:text-[12px] max-mobile:gap-[9px] max-mobile:[&_>_span:first-of-type]:hidden max-mobile:[&_>_span:nth-of-type(2)]:hidden"
              }
            >
              <button
                className={
                  "icon-button border-0 bg-transparent items-center justify-center rounded-[5px] text-[#6b7a73] p-[7px] [&:hover]:bg-[#eff5f1] mobile-menu hidden max-mobile:inline-flex"
                }
                aria-label="Open navigation"
                onClick={() => setMenu(true)}
              >
                <Menu size={21} />
              </button>
              <span>Workspace</span>
              <span>/</span>
              <strong>{active.label}</strong>
            </div>
            <div className={"topbar-right flex items-center gap-[26px]"}>
              <span
                className={
                  "academic-period text-[12px] text-[#6c7972] max-wide:hidden"
                }
              >
                Academic year 2026–27
              </span>
              <div
                className={
                  "user-block flex items-center border-l border-solid border-l-line pl-[23px] gap-[10px] [&_strong]:block [&_strong]:font-semibold [&_strong]:text-[13px] [&_small]:block [&_small]:text-[11px] [&_small]:text-[#6e7875] [&_small]:mt-[3px] max-tablet:pl-[14px] max-tablet:[&_strong]:max-w-[130px] max-tablet:[&_strong]:whitespace-nowrap max-tablet:[&_strong]:text-ellipsis max-tablet:[&_strong]:overflow-hidden max-mobile:border-0 max-mobile:p-0 max-mobile:[&_>_div:last-child]:hidden"
                }
              >
                <div
                  className={
                    "avatar w-[35px] h-[35px] rounded-full bg-[#ebefe3] text-[#657950] grid place-items-center text-[13px] font-semibold"
                  }
                >
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
            <div
              className={
                "content max-w-[1550px] pt-8 pb-[35px] min-h-[calc(100vh_-_150px)] px-9 m-auto cinema:pt-10 max-wide:px-[25px] max-wide:py-[27px] max-mobile:min-h-[calc(100vh_-_130px)] max-mobile:px-4 max-mobile:py-[23px] print:p-0"
              }
            >
              {content()}
            </div>
            <footer
              className={
                "page-footer pt-3 pb-5 flex justify-between text-[#707874] text-[11px] px-9 max-mobile:pt-[5px] max-mobile:pb-[18px] max-mobile:text-[10px] max-mobile:px-4 max-mobile:[&_>_span:last-child]:hidden print:hidden"
              }
            >
              <span>ExamEase · Examination Management System</span>
              <span>Team T021 · SWE Project</span>
            </footer>
          </main>
        </div>
        {toast && (
          <div
            className={
              "toast fixed right-7 bottom-[25px] max-w-[calc(100%_-_40px)] bg-[#204c39] text-white shadow-[0_10px_40px_#203f3029] rounded-[9px] flex items-center text-[14px] z-100 px-[18px] py-[15px] gap-[11px] [&_button]:border-0 [&_button]:bg-[none] [&_button]:text-white [&_button]:flex [&_button]:ml-[10px] max-mobile:right-4 max-mobile:bottom-4 max-mobile:text-[13px]"
            }
            role="status"
          >
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
