// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Adjust path based on your shadcn config
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-4px)] flex-col items-center justify-center bg-background px-4 text-center">
      {/* Subtle Background Glow Decorative Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      <div className="space-y-6 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-500">
        {/* Icon Visual Anchor */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border shadow-sm">
          <FileQuestion className="h-10 w-10 text-primary" />
        </div>

        {/* Text Headers */}
        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold tracking-tighter text-muted-foreground/30">
            404
          </h1>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Page not found
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Sorry, we couldn’t find the page you’re looking for. It might have been moved, deleted, or never existed.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild variant="default" className="shadow-sm">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go back home
            </Link>
          </Button>
          <Button asChild variant="outline">
            {/* Standard browser back mechanism */}
            <Link href="..">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous page
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
