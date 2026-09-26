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
import "./agent.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Display faces from the Paper design (ADR-0037). To turn them on, add the files to app/fonts/
// (SebSansDisplay-Regular.woff2, SebSansDisplay-Bold.woff2, SebSansVar.woff2), uncomment this block,
// and add ${sebDisplay.variable} ${sebVar.variable} to the <html> className. Until then, --font-display
// and --font-button fall back to Geist.
//
// import localFont from "next/font/local";
// const sebDisplay = localFont({
//   variable: "--font-seb-display",
//   src: [
//     { path: "./fonts/SebSansDisplay-Regular.woff2", weight: "400" },
//     { path: "./fonts/SebSansDisplay-Bold.woff2", weight: "700" },
//   ],
// });
// const sebVar = localFont({ variable: "--font-seb-var", src: "./fonts/SebSansVar.woff2", weight: "100 900" });

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
              '(()=>{try{var t=localStorage.getItem("markdown-kb:theme"),c=t==="light"||t==="dark"||t==="system"?t:"dark",d=c==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):c;document.documentElement.dataset.theme=d;var p=JSON.parse(localStorage.getItem("markdown-kb:prefs")||"{}");if(p&&p.motion==="reduce")document.documentElement.dataset.motion="reduce"}catch(e){}})()',
          }}
        />
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
