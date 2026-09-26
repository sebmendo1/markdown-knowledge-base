"use client";

import type { ReactNode } from "react";

export function Pane({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <section className="settings-pane" aria-label={title}>
      <h3>{title}</h3>
      <p className="settings-lead">{lead}</p>
      {children}
    </section>
  );
}

// inline keeps the control beside the label on phones, for a switch.
export function Row({ label, detail, inline, children }: { label: string; detail?: ReactNode; inline?: boolean; children?: ReactNode }) {
  return (
    <div className={inline ? "settings-row is-inline" : "settings-row"}>
      <div>
        <div className="settings-label">{label}</div>
        {detail ? <p>{detail}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="settings-switch" onClick={() => onChange(!checked)}>
      <span className="settings-switch-thumb" aria-hidden="true" />
    </button>
  );
}

export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="theme-switch" role="radiogroup" aria-label={label}>
      {options.map(([option, text]) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          className={value === option ? "is-active" : undefined}
          onClick={() => onChange(option)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function Subhead({ children }: { children: ReactNode }) {
  return <h4 className="settings-subhead">{children}</h4>;
}
