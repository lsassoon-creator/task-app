import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "./LoadingSkeleton";

const PUBLIC_ROUTES = ["/"];
const DEFAULT_AUTHENTICATED_ROUTE = "/dashboard";
const DEFAULT_PUBLIC_ROUTE = "/";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // If logged in and on public route, redirect to dashboard
    if (isLoggedIn && pathname === DEFAULT_PUBLIC_ROUTE) {
      router.replace(DEFAULT_AUTHENTICATED_ROUTE);
      return;
    }
    
    // If not logged in and not on public route, redirect to login
    if (!isLoggedIn && !isPublicRoute) {
      router.replace(DEFAULT_PUBLIC_ROUTE);
      return;
    }

    setIsReady(true);
  }, [isLoggedIn, isLoading, pathname, router]);

  if (!isReady) return <LoadingSkeleton />;

  return <>{children}</>;
}
