"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function DownloadButton() {
    return (
        <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => window.print()}
        >
            <Download className="h-4 w-4" />
        </Button>
    )
}
