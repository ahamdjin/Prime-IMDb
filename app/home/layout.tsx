import type { ReactNode } from "react";
import Navbar from "../components/Navbar";
import { hasAuth } from "../utlis/runtime";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <><Navbar authEnabled={hasAuth} /><main>{children}</main></>;
}
