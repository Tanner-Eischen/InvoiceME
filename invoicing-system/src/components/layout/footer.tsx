export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} ERP Invoicing System. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:underline"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:underline"
          >
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
