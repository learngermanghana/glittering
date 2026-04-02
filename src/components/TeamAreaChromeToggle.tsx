"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const teamRoutes = ["/dashboard", "/login", "/sms", "/campaigns", "/calendar"];

function isTeamRoute(pathname: string) {
  return teamRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function TeamAreaChromeToggle() {
  const pathname = usePathname();

  useEffect(() => {
    const showTeamLayout = isTeamRoute(pathname);

    document.body.dataset.teamArea = showTeamLayout ? "true" : "false";

    return () => {
      document.body.dataset.teamArea = "false";
    };
  }, [pathname]);

  return null;
}
