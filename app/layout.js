import "./globals.css";

export const metadata = {
  title: "GitVitals - Medical Vitals Tracking",
  description: "A web application for medical assisting students to practice taking and submitting patient vitals, with instructor review and grading.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
