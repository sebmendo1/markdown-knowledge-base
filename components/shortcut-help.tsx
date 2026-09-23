"use client";

export function ShortcutHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="help" role="dialog" aria-label="Shortcuts" onMouseDown={(event) => event.stopPropagation()}>
        <h2>Shortcuts</h2>
        <Shortcut keys="⌘K" label="Search pages" />
        <Shortcut keys="⌘/" label="Switch between blocks and Markdown source" />
        <Shortcut keys={"⌘" + String.fromCharCode(92)} label="Show or hide the outline" />
        <Shortcut keys="E" label="Start editing" />
        <Shortcut keys="/" label="Insert a block while editing" />
        <Shortcut keys="[[" label="Link to a page while editing" />
        <Shortcut keys="C" label="Create a page" />
        <Shortcut keys="⌘S" label="Save a version" />
        <Shortcut keys="⌘," label="Open settings" />
        <Shortcut keys="?" label="Show this list" />
        <p className="help-note">On Linux and Windows, Ctrl is the modifier.</p>
      </div>
    </div>
  );
}

function Shortcut({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="shortcut">
      <span>{label}</span>
      <kbd>{keys}</kbd>
    </div>
  );
}
