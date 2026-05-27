import * as React from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center border px-2.5 py-1 text-xs font-medium transition-colors", className)} {...props} />;
}

export { Badge };
