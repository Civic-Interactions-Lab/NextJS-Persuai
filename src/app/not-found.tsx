import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <Logo size={32} className="justify-center" />
        <div className="space-y-3">
          <h1 className="text-6xl font-bold tracking-tight">404</h1>
          <h2 className="text-2xl font-semibold tracking-tight">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
