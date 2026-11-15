import { useEffect, useRef } from "react";
const editors = new Set<symbol>();
export function confirmDiscard() {
  return (
    !editors.size ||
    window.confirm(
      "You have unsaved changes. Discard them and leave this screen?",
    )
  );
}
export function useUnsavedChanges(dirty: boolean) {
  const id = useRef(Symbol("editor"));
  useEffect(() => {
    if (!dirty) return;
    const key = id.current;
    editors.add(key);
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      editors.delete(key);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [dirty]);
}
