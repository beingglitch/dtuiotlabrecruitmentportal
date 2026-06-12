import "./globals.css";

export const metadata = {
  title: "Student Registration Portal",
  description: "Register and manage student intake",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
