import Link from "next/link";

export default function NotFound() {
  return (
    <main className="missing">
      <div>
        <h1>This page is not in the knowledge base.</h1>
        <p>
          <Link href="/docs/writing">Back to writing</Link>
        </p>
      </div>
    </main>
  );
}
