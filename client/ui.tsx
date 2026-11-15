import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useId,
  Children,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  ChevronRight,
  Search,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import type { User } from "../shared/types";
import { useUnsavedChanges } from "./unsaved";
export function PasswordInput(
  props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">,
) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="password-input"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setVisible(false);
      }}
    >
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="password-toggle"
        disabled={props.disabled}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </span>
  );
}
const ModalGuardContext = createContext<
  (dirty: boolean, busy: boolean) => void
>(() => {});
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
        <tbody>
          {Children.toArray(children).length ? (
            children
          ) : (
            <tr>
              <td colSpan={headers.length} className="table-empty">
                No records match the current selection.
              </td>
            </tr>
          )}
        </tbody>
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
  busy = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const guard = useRef({ dirty: false, busy: false }),
    titleId = useId();
  const close = () => {
    if (busy || guard.current.busy) return;
    if (
      guard.current.dirty &&
      !window.confirm("Discard the unsaved changes in this form?")
    )
      return;
    onClose();
  };
  useEffect(() => {
    ref.current?.showModal();
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "modal wide" : "modal"}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          disabled={busy}
          onClick={close}
        >
          <X size={20} />
        </button>
      </div>
      <ModalGuardContext.Provider
        value={(dirty, saving) => {
          guard.current = { dirty, busy: saving };
        }}
      >
        {children}
      </ModalGuardContext.Provider>
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
  minLength?: number;
  maxLength?: number;
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
  const dirty = fields.some((field) =>
    field.type === "checkbox"
      ? Boolean(values[field.name]) !== Boolean(initial[field.name])
      : String(values[field.name] ?? "") !== String(initial[field.name] ?? ""),
  );
  const modalGuard = useContext(ModalGuardContext);
  useUnsavedChanges(dirty);
  useEffect(() => {
    modalGuard(dirty, busy);
    return () => modalGuard(false, false);
  }, [dirty, busy, modalGuard]);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setError("");
        try {
          const result = { ...values };
          fields.forEach((f) => {
            if (f.type === "number")
              result[f.name] =
                values[f.name] === "" || values[f.name] === undefined
                  ? null
                  : Number(values[f.name]);
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
                  disabled={busy || f.disabled}
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
                    disabled={busy || f.disabled}
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
                ) : f.type === "password" ? (
                  <PasswordInput
                    aria-label={f.label}
                    required={f.required !== false}
                    disabled={busy || f.disabled}
                    autoComplete="new-password"
                    minLength={f.minLength || 10}
                    maxLength={f.maxLength || 128}
                    value={String(values[f.name] ?? "")}
                    onChange={(event) =>
                      setValues({ ...values, [f.name]: event.target.value })
                    }
                  />
                ) : (
                  <input
                    aria-label={f.label}
                    type={f.type || "text"}
                    required={f.required !== false}
                    disabled={busy || f.disabled}
                    minLength={f.minLength}
                    maxLength={f.maxLength || 120}
                    min={f.min}
                    max={f.max}
                    step={f.step}
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
        <button
          type="button"
          className="button secondary"
          disabled={busy}
          onClick={() => {
            if (
              !dirty ||
              window.confirm("Discard the unsaved changes in this form?")
            )
              onClose();
          }}
        >
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
  reasonRequired = false,
}: {
  title: string;
  message: string;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
  reasonRequired?: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [reason, setReason] = useState("");
  return (
    <Modal title={title} onClose={onClose} busy={busy}>
      <p className="confirm-message">{message}</p>
      {reasonRequired && (
        <label className="field reason-field">
          <span>Reason for correction</span>
          <textarea
            value={reason}
            minLength={10}
            maxLength={500}
            disabled={busy}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this correction is required (at least 10 characters)."
          />
        </label>
      )}
      <ErrorMessage message={error} />
      <div className="modal-actions">
        <button className="button secondary" disabled={busy} onClick={onClose}>
          Cancel
        </button>
        <button
          className="button"
          disabled={busy || (reasonRequired && reason.trim().length < 10)}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm(reason.trim());
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
