'use client';
import { useEffect, useRef, type ReactNode } from 'react';
export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const d = ref.current;
    d?.showModal();
    return () => {
      d?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const b = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < b.left ||
            e.clientX > b.right ||
            e.clientY < b.top ||
            e.clientY > b.bottom
          )
            onClose();
        }
      }}
    >
      <div className="dialog-head">
        <h2>{title}</h2>
        <button onClick={onClose} aria-label="Close dialog">
          ✕
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Confirm({
  title,
  onClose,
  onConfirm,
}: {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog title={title} onClose={onClose}>
      <p>This cannot be undone. Export anything you want to keep first.</p>
      <div className="actions">
        <button autoFocus onClick={onClose}>
          Keep it
        </button>
        <button
          className="danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Confirm clear
        </button>
      </div>
    </Dialog>
  );
}
