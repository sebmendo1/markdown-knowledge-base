import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastHost } from "@/components/toast-host";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./sidebar.css";
import "./reading.css";
import "./shape.css";
import "./theme.css";
import "./settings.css";
import "./columns.css";
import "./share.css";
import "./tree.css";
import "./block-editor.css";
import "./projects.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: { default: "markdown-kb", template: "%s" },
  description: "A Markdown knowledge base for reading and editing notes, diagrams, and charts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* Browser extensions (writing assistants, password managers) add attributes to <body> before hydration. */}
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(()=>{try{var t=localStorage.getItem("markdown-kb:theme"),c=t==="light"||t==="dark"||t==="system"?t:"dark",d=c==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):c;document.documentElement.dataset.theme=d}catch(e){}})()',
          }}
        />
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
