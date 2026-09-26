"use client";

import type { ReactNode, RefObject } from "react";
import type { Heading } from "@/lib/markdown/outline";
import type { Workspace } from "@/lib/workspace/model";
import { hrefOf } from "@/lib/workspace/paths";
import type { ProjectEntry } from "@/lib/workspace/projects";
import type { PageDoc } from "@/lib/workspace/tree";
import type { AgentSession } from "./agent-activity";
import { useAgentChanges } from "./agent-changes";
import { AgentStage } from "./agent-stage";
import { setSidebarExpanded, useSidebarExpanded, type Mode } from "./draft-store";
import { DocumentChrome } from "./document-chrome";
import { FileSidebar } from "./file-sidebar";
import { HistoryDialog } from "./history-dialog";
import { EmptyProject, MissingPage, UnknownProject } from "./missing-page";
import { MoveDialog } from "./move-dialog";
import { OutlinePanel } from "./outline-panel";
import { PageSearch } from "./page-search";
import { PreviewStage } from "./preview-stage";
import { SettingsHost } from "./settings-host";
import { ShareHost } from "./share-host";
import { ShortcutHelp } from "./shortcut-help";
import { TrashDialog } from "./trash-dialog";

export type PageState = "repo" | "edited" | "created" | "missing";

export function WorkspaceView(props: {
  project?: ProjectEntry;
  projects: ProjectEntry[];
  projectKnown: boolean;
  ws: Workspace;
  docs: PageDoc[];
  hydrated: boolean;
  currentPath: string;
  pageId: string | null;
  title: string;
  state: PageState;
  mode: Mode;
  words: number;
  outlineOpen: boolean;
  sidebarOpen: boolean;
  paletteOpen: boolean;
  helpOpen: boolean;
  value: string;
  rendered: ReactNode;
  headings: Heading[];
  linkedFrom: PageDoc[];
  activeHeading: string | null;
  previewRef: RefObject<HTMLDivElement | null>;
  setSidebarOpen: (open: boolean) => void;
  setPaletteOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
  onChange: (next: string) => void;
  agentSession?: AgentSession;
  agentFollowing: boolean;
  agentWatch: { agent: string; path: string } | null;
  onWatchAgent: () => void;
  onResumeFollowing: () => void;
  diskConflict?: boolean;
  onLoadDisk?: () => void;
  go: (href: string) => void;
  jump: (id: string) => void;
}) {
  const missing = props.state === "missing";
  const showOutline = props.outlineOpen && props.mode !== "source" && !missing;
  const expanded = useSidebarExpanded();
  const review = useAgentChanges(missing ? null : props.pageId, props.value);
  const shell = ["shell", expanded ? "" : "is-collapsed", showOutline ? "has-outline" : ""].filter(Boolean).join(" ");
  function showSidebar() {
    setSidebarExpanded(true);
    props.setSidebarOpen(true);
  }
  function hideSidebar() {
    setSidebarExpanded(false);
    props.setSidebarOpen(false);
  }
  if (!props.projectKnown) return <UnknownProject />;
  const body = missing ? (
    !props.hydrated ? (
      <div className="stage preview" />
    ) : props.currentPath ? (
      <MissingPage path={props.currentPath} first={props.docs[0]} go={props.go} />
    ) : props.docs.length === 0 ? (
      <EmptyProject name={props.project?.name ?? "This project"} go={props.go} />
    ) : (
      <div className="stage preview" />
    )
  ) : props.agentSession && props.mode === "preview" && props.agentFollowing ? (
    <AgentStage
      session={props.agentSession}
      value={props.value}
      docs={props.docs}
      path={props.currentPath}
      previewRef={props.previewRef}
    />
  ) : (
    <PreviewStage
      mode={props.mode}
      value={props.value}
      review={review}
      rendered={props.rendered}
      path={props.currentPath}
      docs={props.docs}
      linkedFrom={props.linkedFrom}
      previewRef={props.previewRef}
      onChange={props.onChange}
      go={props.go}
    />
  );
  return (
    <div className={shell}>
      <FileSidebar
        project={props.project}
        projects={props.projects}
        ws={props.ws}
        docs={props.docs}
        currentPath={props.currentPath}
        open={props.sidebarOpen}
        onGo={props.go}
        onSearch={() => props.setPaletteOpen(true)}
        onRetract={hideSidebar}
      />
      {props.sidebarOpen ? <button type="button" className="scrim" aria-label="Close files" onClick={() => props.setSidebarOpen(false)} /> : null}
      <div className="main">
        <DocumentChrome
          title={props.title}
          path={props.currentPath}
          pageId={props.pageId}
          state={props.state}
          words={props.words}
          mode={props.mode}
          review={review}
          onOpenFiles={showSidebar}
          go={props.go}
          banner={
            <>
              {props.diskConflict ? (
                <div className="disk-banner" role="status">
                  <span>This page changed on disk.</span>
                  <button type="button" onClick={props.onLoadDisk}>
                    Load disk version
                  </button>
                </div>
              ) : null}
              {props.agentSession && props.mode !== "preview" ? (
                <div className="disk-banner agent-banner" role="status">
                  <span className="agent-pulse" aria-hidden="true" />
                  <span>{props.agentSession.agent} is editing this page too. Your changes and theirs may conflict.</span>
                </div>
              ) : props.agentSession && !props.agentFollowing && props.mode === "preview" ? (
                <div className="disk-banner agent-banner" role="status">
                  <span className="agent-pulse" aria-hidden="true" />
                  <span>{props.agentSession.agent} is editing this page.</span>
                  <button type="button" onClick={props.onResumeFollowing}>
                    Follow
                  </button>
                </div>
              ) : props.agentWatch ? (
                <div className="disk-banner agent-banner" role="status">
                  <span className="agent-pulse" aria-hidden="true" />
                  <span>
                    {props.agentWatch.agent} is editing {props.agentWatch.path.split("/").pop()}.
                  </span>
                  <button type="button" onClick={props.onWatchAgent}>
                    Watch
                  </button>
                </div>
              ) : null}
            </>
          }
        >
          {body}
        </DocumentChrome>
      </div>
      {showOutline ? <OutlinePanel headings={props.headings} activeHeading={props.activeHeading} onJump={props.jump} /> : null}
      <PageSearch
        docs={props.docs}
        open={props.paletteOpen}
        onClose={() => props.setPaletteOpen(false)}
        onOpen={(path) => props.go(hrefOf(props.project?.slug ?? "", path))}
      />
      <ShortcutHelp open={props.helpOpen} onClose={() => props.setHelpOpen(false)} />
      <MoveDialog ws={props.ws} />
      <TrashDialog ws={props.ws} />
      <HistoryDialog ws={props.ws} docs={props.docs} />
      <SettingsHost canShowShortcuts />
      <ShareHost />
    </div>
  );
}
