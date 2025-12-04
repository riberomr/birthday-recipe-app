"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Link as LinkIcon, Phone } from "lucide-react";
import { useSnackbar } from "@/components/ui/Snackbar";

export function ShareButtons({ title }: { title: string }) {
    const { showSnackbar } = useSnackbar();
    const [isOpen, setIsOpen] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        showSnackbar("Enlace copiado al portapapeles", "success");
        setIsOpen(false);
    };

    const handleWhatsApp = () => {
        const text = `¡Mira esta receta de ${title}! ${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block">
            <Button
                variant="outline"
                size="icon"
                className="rounded-full border-pink-200 text-pink-500 hover:bg-pink-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Share2 className="h-4 w-4" />
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-pink-100 dark:border-pink-900 p-2 z-50 animate-in fade-in zoom-in-95">
                    <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <LinkIcon className="h-4 w-4" />
                        Copiar enlace
                    </button>
                    <button
                        onClick={handleWhatsApp}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <Phone className="h-4 w-4" />
                        WhatsApp
                    </button>
                </div>
            )}
        </div>
    );
}
