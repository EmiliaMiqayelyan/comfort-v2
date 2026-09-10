import Link from "next/link";

/** Root 404 must provide its own html/body because root layout passes children through. */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#E7DFD9",
          color: "#2C333E",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ letterSpacing: "0.3em", color: "#203E4B", margin: 0 }}>404</p>
          <h1 style={{ fontSize: 40, margin: "12px 0" }}>Page not found</h1>
          <Link href="/en" style={{ color: "#2C333E" }}>
            Back to Comfort
          </Link>
        </div>
      </body>
    </html>
  );
}
