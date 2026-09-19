"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";

export default function SiteShell({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) return <>{children}</>;

  return (
    <>
      <Navbar />
      <div>{children}</div>
      <div className="bg-[#E8B931] h-2" />
      <Footer />
    </>
  );
}