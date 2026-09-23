"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent, type ReactNode } from "react";
import type { Workspace } from "@/lib/workspace/model";
import { ancestors, folderOf, hrefOf } from "@/lib/workspace/paths";
import { buildTree, type PageDoc, type TreeNode } from "@/lib/workspace/tree";
import { setMode } from "./draft-store";
import { DotsIcon, PlusIcon } from "./action-icons";
import { importInto, moveFolderTo, movePageTo, newFolder, newPage, renameFolderTo, renamePageTo } from "./page-actions";
import { PopoverMenu, type MenuItem } from "./popover-menu";
import { Chevron, TreeInput } from "./tree-input";
import { treeItems } from "./tree-items";
import { listen, type Target } from "./ui-events";
import { setCollapsed, useCollapsed } from "./workspace-store";

const IMPORT_INPUT = "tree-import";

type Editing = { kind: "new-page" | "new-folder"; folder: string } | { kind: "rename"; target: Target } | null;
type Menu = { x: number; y: number; items: MenuItem[] } | null;

const same = (a: Target, b: Target) =>
  a.kind === b.kind && (a.kind === "page" ? a.id === (b as typeof a).id : a.path === (b as typeof a).path);

export function PageTree({ ws, docs, currentPath, onGo }: { ws: Workspace; docs: PageDoc[]; currentPath: string; onGo: (href: string) => void }) {
  const collapsed = useCollapsed();
  const tree = useMemo(() => buildTree(ws, docs), [ws, docs]);
  const [editing, setEditing] = useState<Editing>(null);
  const [menu, setMenu] = useState<Menu>(null);
  const [drop, setDrop] = useState<string | null>(null);
  const drag = useRef<Target | null>(null);

  useEffect(() => {
    ancestors(folderOf(currentPath)).forEach((folder) => setCollapsed(folder, false));
  }, [currentPath]);

  useEffect(() => {
    const offCreate = listen("markdown-kb-create", (detail) => {
      if (detail.folder) setCollapsed(detail.folder, false);
      setEditing({ kind: detail.kind === "page" ? "new-page" : "new-folder", folder: detail.folder });
    });
    const offRename = listen("markdown-kb-rename", (target) => setEditing({ kind: "rename", target }));
    return () => {
      offCreate();
      offRename();
    };
  }, []);

  function finish(value: string | null) {
    const edit = editing;
    setEditing(null);
    const text = value?.trim();
    if (!edit || !text) return;
    if (edit.kind !== "rename") {
      if (edit.kind === "new-folder") return void newFolder(edit.folder, text);
      setMode("split");
      onGo(hrefOf(newPage(edit.folder, text)));
    } else if (edit.target.kind === "page") {
      renamePageTo(edit.target.id, text);
    } else {
      renameFolderTo(edit.target.path, text);
    }
  }

  const pick = (folder: string) => {
    const input = document.getElementById(IMPORT_INPUT) as HTMLInputElement | null;
    if (!input) return;
    input.dataset.folder = folder;
    input.click();
  };
  const openMenu = (target: Target | null) => (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const items = treeItems(target, onGo, pick);
    if (event.type === "contextmenu") return setMenu({ x: event.clientX, y: event.clientY, items });
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({ x: rect.left, y: rect.bottom + 4, items });
  };
  const dragProps = (target: Target, folder: string) => ({
    draggable: true,
    onDragStart: (event: DragEvent) => {
      drag.current = target;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", target.kind === "page" ? target.id : target.path);
    },
    onDragEnd: () => {
      drag.current = null;
      setDrop(null);
    },
    onDragOver: (event: DragEvent) => {
      const files = event.dataTransfer.types.includes("Files");
      if (!drag.current && !files) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = files ? "copy" : "move";
      setDrop(folder);
    },
    onDrop: (event: DragEvent) => dropInto(event, folder),
  });

  async function dropInto(event: DragEvent, folder: string) {
    event.preventDefault();
    event.stopPropagation();
    setDrop(null);
    const target = drag.current;
    drag.current = null;
    if (event.dataTransfer.files.length > 0) {
      const paths = await importInto(Array.from(event.dataTransfer.files), folder);
      if (paths[0]) onGo(hrefOf(paths[0]));
    } else if (target?.kind === "page") movePageTo(target.id, folder);
    else if (target) moveFolderTo(target.path, folder);
    if (folder) setCollapsed(folder, false);
  }

  const renaming = (target: Target) => editing?.kind === "rename" && same(editing.target, target);

  function nodes(list: TreeNode[], depth: number, folder: string): ReactNode {
    return (
      <>
        {list.map((node) => (node.kind === "folder" ? folderRow(node, depth) : pageRow(node.doc, depth)))}
        {editing && editing.kind !== "rename" && editing.folder === folder ? (
          <TreeInput depth={depth} placeholder={editing.kind === "new-page" ? "Page title" : "Folder name"} onDone={finish} />
        ) : null}
      </>
    );
  }

  function folderRow(node: Extract<TreeNode, { kind: "folder" }>, depth: number) {
    const target: Target = { kind: "folder", path: node.path };
    const open = !collapsed.has(node.path);
    if (renaming(target)) return <TreeInput key={node.path} depth={depth} initial={node.name} placeholder="Folder name" onDone={finish} />;
    return (
      <div key={node.path}>
        <div
          className={drop === node.path ? "tree-row is-drop" : "tree-row"}
          style={{ "--depth": depth } as CSSProperties}
          onContextMenu={openMenu(target)}
          onDragLeave={() => setDrop((value) => (value === node.path ? null : value))}
          {...dragProps(target, node.path)}
        >
          <button type="button" className="tree-folder" aria-expanded={open} onClick={() => setCollapsed(node.path, open)}>
            <Chevron open={open} />
            <span>{node.name}</span>
          </button>
          <span className="tree-actions">
            <button type="button" className="tree-action" aria-label={`New page in ${node.name}`} onClick={() => setEditing({ kind: "new-page", folder: node.path })}>
              <PlusIcon />
            </button>
            <button type="button" className="tree-action" aria-label={`${node.name} actions`} onClick={openMenu(target)}>
              <DotsIcon />
            </button>
          </span>
        </div>
        {open ? nodes(node.children, depth + 1, node.path) : null}
      </div>
    );
  }

  function pageRow(doc: PageDoc, depth: number) {
    const target: Target = { kind: "page", id: doc.id };
    if (renaming(target)) return <TreeInput key={doc.id} depth={depth} initial={doc.title} placeholder="Page title" onDone={finish} />;
    return (
      <div key={doc.id} className="tree-row" style={{ "--depth": depth } as CSSProperties} onContextMenu={openMenu(target)} {...dragProps(target, folderOf(doc.path))}>
        <Link href={hrefOf(doc.path)} className="tree-link" aria-current={doc.path === currentPath ? "page" : undefined} onClick={() => onGo("")}>
          {doc.title}
        </Link>
        <span className="tree-actions">
          <button type="button" className="tree-action" aria-label={`${doc.title} actions`} onClick={openMenu(target)}>
            <DotsIcon />
          </button>
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="tree-head">
        <span>Pages</span>
        <button type="button" className="tree-action" aria-label="New page" onClick={() => setEditing({ kind: "new-page", folder: "" })}>
          <PlusIcon />
        </button>
        <button type="button" className="tree-action" aria-label="Workspace actions" onClick={openMenu(null)}>
          <DotsIcon />
        </button>
      </div>
      <nav
        className={drop === "" ? "tree is-drop" : "tree"}
        aria-label="Pages"
        onDragOver={(event) => {
          if (!drag.current && !event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          setDrop("");
        }}
        onDrop={(event) => dropInto(event, "")}
      >
        {tree.length === 0 && !editing ? <p className="tree-empty">No pages yet. Press + to write the first one.</p> : null}
        {nodes(tree, 0, "")}
      </nav>
      <input
        id={IMPORT_INPUT}
        type="file"
        accept=".md,.markdown,.txt,text/markdown"
        multiple
        hidden
        onChange={async (event) => {
          const input = event.currentTarget;
          const files = Array.from(input.files ?? []);
          input.value = "";
          const paths = await importInto(files, input.dataset.folder ?? "");
          if (paths[0]) onGo(hrefOf(paths[0]));
        }}
      />
      {menu ? (
        <PopoverMenu x={menu.x} y={menu.y} label="Page actions" items={menu.items} onClose={() => setMenu(null)} />
      ) : null}
    </>
  );
}
