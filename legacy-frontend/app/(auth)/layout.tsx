export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Invoicing System</h1>
          <p className="text-muted-foreground">
            A modern, cloud-based invoicing system for small businesses
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow">
          {children}
        </div>
      </div>
    </div>
  );
}
