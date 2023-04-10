import "./globals.css";

export const metadata = {
  title: "Share Env",
  description: "Share environment variables securely",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative min-h-screen bg-black bg-gradient-to-tr from-zinc-900/50 to-zinc-700/30">
        <main className=" min-h-[80vh] ">{children}</main>
      </body>
    </html>
  );
}
