import "./globals.css";

export const metadata = {
  title: "Next.js Text Reveal Animation | Codegrid",
  description: "Next.js Text Reveal Animation | Codegrid",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
