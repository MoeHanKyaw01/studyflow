import "./globals.css";

export const metadata = {
  title: "StudyFlow — Assignment Tracker",
  description:
    "Organize assignments, track deadlines, and monitor your study progress.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}