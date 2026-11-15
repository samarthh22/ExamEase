import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import type { User } from "../shared/types";
export const AppContext = createContext<{
  user: User;
  version: number;
  refresh: () => void;
  notify: (message: string) => void;
}>({ user: null!, version: 0, refresh: () => {}, notify: () => {} });
export const useApp = () => useContext(AppContext);
export const roleLabels = {
  STUDENT: "Student",
  FACULTY: "Faculty member",
  EXAM_ADMIN: "Examination administrator",
  HOD: "Department coordinator",
  SYS_ADMIN: "System administrator",
};
export const dateLabel = (date: string) =>
  new Date(`${date}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
export const titleCase = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
export function Badge({ value }: { value: string }) {
  return (
    <span
      className={`badge ${["PUBLISHED", "REGISTERED", "Active"].includes(value) ? "green" : ["CANCELLED", "Inactive", "NEEDS_RECALCULATION", "F"].includes(value) ? "red" : ["DRAFT", "UNPUBLISHED", "Pending"].includes(value) ? "amber" : ""}`}
    >
      <i />
      {titleCase(value)}
    </span>
  );
}
export function Heading({
  eyebrow = "EXAMINATION MANAGEMENT",
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <div className="panel-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <div className="error" role="alert">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  ) : null;
}
export function Empty({
  title = "Nothing here yet",
  description = "Records will appear here when they are available.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Check size={24} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      Loading examination records…
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search records…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search">
      <Search size={17} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export function Stat({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className="stat-icon">{icon || <ArrowUpRight size={19} />}</div>
      </div>
      <strong>{value}</strong>
      {detail && <p>{detail}</p>}
    </div>
  );
}
export function LinkButton({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <a className="text-link" href={`#${to}`}>
      {children}
      <ChevronRight size={16} />
    </a>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "modal wide" : "modal"}
      onCancel={onClose}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export type Field = {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "time"
    | "select"
    | "checkbox";
  options?: { value: string; label: string }[];
  required?: boolean;
  min?: number;
  max?: number;
  step?: string;
  hint?: string;
  disabled?: boolean;
};
export type FormValues = Record<string, string | number | boolean | null>;
export function RecordForm({
  fields,
  initial = {},
  onSave,
  onClose,
  submitLabel = "Save changes",
}: {
  fields: Field[];
  initial?: FormValues;
  onSave: (values: FormValues) => Promise<void>;
  onClose: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<FormValues>(initial),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const result = { ...values };
          fields.forEach((f) => {
            if (f.type === "number") result[f.name] = Number(values[f.name]);
            if (f.type === "checkbox") result[f.name] = !!values[f.name];
          });
          await onSave(result);
          onClose();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="form-grid">
        {fields.map((f) => (
          <label
            key={f.name}
            className={f.type === "checkbox" ? "checkbox-field" : "field"}
          >
            {f.type === "checkbox" ? (
              <>
                <input
                  type="checkbox"
                  checked={!!values[f.name]}
                  onChange={(e) =>
                    setValues({ ...values, [f.name]: e.target.checked })
                  }
                />
                {f.label}
              </>
            ) : (
              <>
                <span>
                  {f.label}
                  {f.required !== false && <b> *</b>}
                </span>
                {f.type === "select" ? (
                  <select
                    aria-label={f.label}
                    required={f.required !== false}
                    disabled={f.disabled}
                    value={String(values[f.name] ?? "")}
                    onChange={(e) =>
                      setValues({ ...values, [f.name]: e.target.value })
                    }
                  >
                    <option value="">Select…</option>
                    {f.options?.map((o) => (
                      <option value={o.value} key={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    aria-label={f.label}
                    type={f.type || "text"}
                    required={f.required !== false}
                    disabled={f.disabled}
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    autoComplete={
                      f.type === "password" ? "new-password" : undefined
                    }
                    value={String(values[f.name] ?? "")}
                    onChange={(e) =>
                      setValues({ ...values, [f.name]: e.target.value })
                    }
                  />
                )}
              </>
            )}
            {f.hint && <small>{f.hint}</small>}
          </label>
        ))}
      </div>
      <ErrorMessage message={error} />
      <div className="modal-actions">
        <button type="button" className="button secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="button" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
export function Confirm({
  title,
  message,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal title={title} onClose={onClose}>
      <p className="confirm-message">{message}</p>
      <ErrorMessage message={error} />
      <div className="modal-actions">
        <button className="button secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          className="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
              onClose();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Working…" : "Confirm"}
        </button>
      </div>
    </Modal>
  );
}
