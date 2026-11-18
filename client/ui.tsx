import { cn } from "./cn";
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
      className={
        "password-input relative block w-full [&_>_input]:w-full [&_>_input]:pr-12!"
      }
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
        className={
          "password-toggle absolute right-1 top-[50%] -translate-y-1/2 grid place-items-center w-10 h-10 border-0 rounded-[5px] bg-transparent text-brand [&:hover]:bg-[#edf5f1]"
        }
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
  TA: "Teaching assistant",
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
      className={cn(
        `badge inline-flex items-center rounded-[5px] bg-[#edf2f6] text-[#667988] text-[10px] font-semibold whitespace-nowrap px-2 py-1 gap-[5px] [&_i]:h-1 [&_i]:w-1 [&_i]:bg-current [&_i]:rounded-full [&.green]:bg-[#edf5ed] [&.green]:text-[#5b815a] [&.amber]:bg-[#fcf5e8] [&.amber]:text-[#8a7542] [&.red]:bg-[#fbedeb] [&.red]:text-[#9c6c66] ${["PUBLISHED", "REGISTERED", "Active"].includes(value) ? "green" : ["CANCELLED", "Inactive", "NEEDS_RECALCULATION", "F"].includes(value) ? "red" : ["DRAFT", "UNPUBLISHED", "Pending"].includes(value) ? "amber" : ""}`,
      )}
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
    <div
      className={
        "page-heading flex justify-between items-center mb-[27px] gap-5 [&_p]:text-[#6c7973] [&_p]:text-[14px] [&_p]:mt-2 max-tablet:items-start max-tablet:[&_h1]:text-[25px] max-mobile:flex-wrap max-mobile:mb-[22px] max-mobile:gap-4 max-mobile:[&_h1]:text-[25px] max-mobile:[&_p]:text-[13px] max-mobile:[&_>_.button]:text-[13px]"
      }
    >
      <div>
        <div
          className={
            "eyebrow text-[11px] tracking-[1.6px] text-[#6a7a71] font-semibold mb-[10px]"
          }
        >
          {eyebrow}
        </div>
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
    <section
      className={cn(
        `panel border border-solid border-line bg-[#fff] rounded-[9px] mb-6 overflow-hidden print:break-inside-avoid ${className}`,
      )}
    >
      {title && (
        <div
          className={
            "panel-head pt-[21px] pb-[19px] border-b border-solid border-b-[#edf0ed] flex justify-between items-center px-[23px] gap-[18px] [&_h2]:text-[14px] [&_h2]:tracking-0 [&_p]:text-[#6e7972] [&_p]:text-[12px] [&_p]:mt-[5px] max-mobile:p-[18px] max-mobile:[&_h2]:text-[14px] max-mobile:[&_p]:text-[11px] max-mobile:[&_.button]:text-[12px] max-mobile:[&_.button]:px-[10px] max-mobile:[&_.button]:py-2 max-mobile:[&_.text-link]:text-[12px] max-mobile:[&_.text-link]:whitespace-nowrap"
          }
        >
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
    <div
      className={
        "error bg-[#fff0ed] border border-solid border-[#f1ccc5] rounded-[7px] text-[#9c3d32] flex items-start text-[14px] px-[15px] py-[13px] mx-0 my-[14px] gap-[9px]"
      }
      role="alert"
    >
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
    <div
      className={
        "empty text-center text-[#6f796c] px-5 py-[45px] [&_h3]:text-[14px] [&_h3]:text-[#6c8263] [&_h3]:mt-3 [&_p]:text-[13px] [&_p]:mt-[6px] [&_p]:max-w-[370px] [&_p]:mx-auto"
      }
    >
      <div
        className={
          "empty-icon h-11 w-11 rounded-full bg-[#f0f5ed] text-[#6f7a62] grid place-items-center m-auto"
        }
      >
        <Check size={24} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function Loading() {
  return (
    <div
      className={
        "loading flex justify-center items-center text-muted px-5 py-15 gap-3"
      }
      role="status"
    >
      <span
        className={
          "spinner h-[18px] w-[18px] border-[2px] border-solid border-[#dce9e1] border-t-brand rounded-full animate-spin"
        }
      />
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
    <label
      className={
        "search flex items-center border border-solid border-[#e2e8e3] bg-[#fff] rounded-[7px] text-[#6f7971] min-w-65 max-w-full px-3 py-0 gap-[9px] [&_input]:border-0 [&_input]:w-full [&_input]:text-[13px] [&_input]:outline-none [&_input]:px-0 [&_input]:py-[9px] max-mobile:min-w-0 max-mobile:w-full"
      }
    >
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
    <div className={"table-wrap overflow-auto"}>
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
              <td
                colSpan={headers.length}
                className={"table-empty text-center text-muted p-[30px]!"}
              >
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
    <div
      className={
        "stat-card bg-white border border-solid border-line rounded-[9px] px-5 py-[19px] [&_>_strong]:text-[31px] [&_>_strong]:block [&_>_strong]:font-semibold [&_>_strong]:tracking-[-1px] [&_>_strong]:mt-[5px] [&_>_strong]:text-[#284739] [&_>_strong]:leading-[1.2] [&_p]:text-[11px] [&_p]:text-[#707871] [&_p]:mt-[11px] max-wide:p-4 max-mobile:[&_>_strong]:text-[29px] max-mobile:[&_p]:text-[11px] max-mobile:p-4"
      }
    >
      <div
        className={
          "stat-top flex justify-between items-center text-[#6c7972] text-[13px] gap-[6px] max-mobile:text-[12px]"
        }
      >
        <span>{label}</span>
        <div
          className={
            "stat-icon w-[31px] h-[31px] bg-[#f0f5f1] rounded-[8px] text-[#5a806a] grid place-items-center max-mobile:w-[26px] max-mobile:h-[26px]"
          }
        >
          {icon || <ArrowUpRight size={19} />}
        </div>
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
    <a
      className={
        "border-0 bg-[none] text-brand text-[14px] font-semibold inline-flex items-center px-0 py-1 gap-1 [&:hover]:underline"
      }
      href={`#${to}`}
    >
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
      className={cn(
        wide
          ? "modal w-[min(580px,_calc(100%_-_32px))] max-h-[90vh] overflow-auto border border-solid border-[#dce6dc] rounded-[12px] text-inherit shadow-[0_25px_100px_#173c3329] p-6 [&.wide]:w-[min(800px,_calc(100%_-_32px))] [&::backdrop]:bg-[#193a3566] [&::backdrop]:backdrop-blur-[3px] max-mobile:p-[21px] print:[&[open]]:absolute print:[&[open]]:inset-0 print:[&[open]]:max-h-none print:[&[open]]:w-full print:[&[open]]:border-0 print:[&[open]]:shadow-none print:[&[open]]:visible print:[&::backdrop]:bg-white wide"
          : "modal w-[min(580px,_calc(100%_-_32px))] max-h-[90vh] overflow-auto border border-solid border-[#dce6dc] rounded-[12px] text-inherit shadow-[0_25px_100px_#173c3329] p-6 [&.wide]:w-[min(800px,_calc(100%_-_32px))] [&::backdrop]:bg-[#193a3566] [&::backdrop]:backdrop-blur-[3px] max-mobile:p-[21px] print:[&[open]]:absolute print:[&[open]]:inset-0 print:[&[open]]:max-h-none print:[&[open]]:w-full print:[&[open]]:border-0 print:[&[open]]:shadow-none print:[&[open]]:visible print:[&::backdrop]:bg-white",
      )}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div
        className={
          "modal-head flex justify-between items-center pb-5 border-b border-solid border-b-line mb-[22px] print:[dialog_&]:hidden"
        }
      >
        <h2 id={titleId}>{title}</h2>
        <button
          className={
            "icon-button border-0 bg-transparent inline-flex items-center justify-center rounded-[5px] text-[#6b7a73] p-[7px] [&:hover]:bg-[#eff5f1]"
          }
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
      <div
        className={
          "form-grid grid grid-cols-[1fr_1fr] gap-[17px] max-mobile:grid-cols-[1fr]"
        }
      >
        {fields.map((f) => (
          <label
            key={f.name}
            className={cn(
              f.type === "checkbox"
                ? "checkbox-field [&_small]:text-[#707968] [&_small]:text-[12px] [&_small]:leading-[1.5] [&_small]:ml-auto flex items-center text-[14px] col-span-full gap-2"
                : "field flex flex-col text-[14px] min-w-0 gap-[7px] [&_>_span]:font-medium [&_>_span]:text-[#60765b] [&_b]:text-[#867555] [&_b]:font-normal [&_small]:text-[#707968] [&_small]:text-[12px] [&_small]:leading-[1.5] [&_input]:text-[14px] [&_input]:w-full [&_select]:text-[14px] [&_select]:w-full",
            )}
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
      <div
        className={
          "modal-actions flex justify-end mt-[25px] pt-[18px] border-t border-solid border-t-line gap-3 print:[dialog_&]:hidden"
        }
      >
        <button
          type="button"
          className={
            "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden secondary"
          }
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
        <button
          className={
            "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden"
          }
          disabled={busy}
        >
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
      <p className={"confirm-message text-[14px] text-[#6d8265] leading-[1.8]"}>
        {message}
      </p>
      {reasonRequired && (
        <label
          className={
            "field flex flex-col text-[14px] min-w-0 gap-[7px] [&_>_span]:font-medium [&_>_span]:text-[#60765b] [&_b]:text-[#867555] [&_b]:font-normal [&_small]:text-[#707968] [&_small]:text-[12px] [&_small]:leading-[1.5] [&_input]:text-[14px] [&_input]:w-full [&_select]:text-[14px] [&_select]:w-full reason-field mt-[18px] [&_textarea]:resize-y [&_textarea]:min-h-[95px] [&_textarea]:w-full [&_textarea]:border [&_textarea]:border-solid [&_textarea]:border-[#dce4e1] [&_textarea]:rounded-[7px] [&_textarea]:text-inherit [&_textarea]:px-3 [&_textarea]:py-[10px]"
          }
        >
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
      <div
        className={
          "modal-actions flex justify-end mt-[25px] pt-[18px] border-t border-solid border-t-line gap-3 print:[dialog_&]:hidden"
        }
      >
        <button
          className={
            "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden secondary"
          }
          disabled={busy}
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className={
            "button inline-flex items-center justify-center bg-brand border border-solid border-brand rounded-[7px] text-[#fff] text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ease-[ease] px-4 py-[10px] gap-2 [&:hover:not(:disabled)]:bg-brand-dark [&.secondary]:text-[#35594c] [&.secondary]:bg-white [&.secondary]:border-[#d8e2dd] [&.secondary:hover:not(:disabled)]:bg-[#edf5f1] print:hidden"
          }
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
