/** GitHub serves the logged-in dashboard at both of these. */
export function isHomePath(pathname: string): boolean {
  return pathname === "/" || pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}
