import { ReactNode } from "react";

import { ExternalIntakeProvider } from "@/store/external-intake-context";

export default function ExternalLayout({ children }: { children: ReactNode }) {
  return <ExternalIntakeProvider>{children}</ExternalIntakeProvider>;
}
