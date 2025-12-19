"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
    return (
        <Button
            variant="outline"
            size="icon"
            className="rounded-full border-primary/20 text-primary [@media(hover:hover)]:hover:bg-primary/10"
            onClick={() => window.print()}
        >
            <Printer className="h-4 w-4" />
        </Button>
    );
}
