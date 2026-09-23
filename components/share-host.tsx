"use client";

import { useEffect, useRef, useState } from "react";

const OPEN = "markdown-kb-share";

export type ShareDetail = { title: string; path: string; state: "repo" | "edited" | "created" | "missing" };

const NOTE: Partial<Record<ShareDetail["state"], string>> = {
  edited: "Your edits live in this browser. The link opens the repository copy.",
  created: "This page lives in this browser. Others who open the link won’t see it. Export it to share the file.",
};

export function openShare(detail: ShareDetail) {
  window.dispatchEvent(new CustomEvent<ShareDetail>(OPEN, { detail }));
}

type Access = "view" | "edit";

function accessKey(path: string) {
  return `markdown-kb:access:${path}`;
}

function readAccess(path: string): Access {
  return window.localStorage.getItem(accessKey(path)) === "edit" ? "edit" : "view";
}

function pageLink(access: Access) {
  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.set("edit", access === "edit" ? "1" : "0");
  return url.toString();
}

export function ShareHost() {
  const [detail, setDetail] = useState<ShareDetail | null>(null);
  const [access, setAccess] = useState<Access>("view");
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const show = (event: Event) => {
      const next = (event as CustomEvent<ShareDetail>).detail;
      setAccess(readAccess(next.path));
      setCopied(false);
      setDetail(next);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetail(null);
    };
    window.addEventListener(OPEN, show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN, show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (detail) dialogRef.current?.focus();
  }, [detail]);

  if (!detail) return null;
  const link = pageLink(access);

  function choose(next: Access) {
    setAccess(next);
    setCopied(false);
    window.localStorage.setItem(accessKey(detail!.path), next);
  }

  async function copy() {
    const field = linkRef.current;
    field?.focus();
    field?.select();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      return;
    } catch {
      setCopied(document.execCommand("copy"));
    }
  }

  return (
    <div className="overlay share-overlay" onMouseDown={() => setDetail(null)}>
      <div
        ref={dialogRef}
        className="share-dialog"
        role="dialog"
        aria-label={`Share ${detail.title}`}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="share-top">
          <h2>Share “{detail.title}”</h2>
          <button type="button" className="icon-button" aria-label="Close share" onClick={() => setDetail(null)}>
            ×
          </button>
        </header>
        <div className="share-body">
          <div className="settings-label">Anyone with the link</div>
          <p>The link opens this page. Choose whether it starts in viewing or editing.</p>
          {NOTE[detail.state] ? <p className="share-note">{NOTE[detail.state]}</p> : null}
          <input ref={linkRef} className="share-link" readOnly value={link} aria-label="Share link" onFocus={(event) => event.currentTarget.select()} />
          <div className="theme-switch" role="radiogroup" aria-label="Link access">
            <button type="button" role="radio" aria-checked={access === "view"} className={access === "view" ? "is-active" : undefined} onClick={() => choose("view")}>
              Can view
            </button>
            <button type="button" role="radio" aria-checked={access === "edit"} className={access === "edit" ? "is-active" : undefined} onClick={() => choose("edit")}>
              Can edit
            </button>
          </div>
          <div className="share-actions">
            <button type="button" className="share-button" onClick={copy}>
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
