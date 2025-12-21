"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, Check, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { RecipeCategory, Profile } from "@/types";
import { getUsersWithRecipes } from "@/lib/api/users";
import { UserSelect } from "./UserSelect";

interface FilterBarProps {
    categories: RecipeCategory[];
    onFilterChange: (filters: any) => void;
}

export function FilterBar({ categories, onFilterChange }: FilterBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tags, setTags] = useState<{ id: string; name: string; type: string }[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);

    // Active filters (applied)
    const [activeFilters, setActiveFilters] = useState({
        search: "",
        category: "",
        difficulty: "",
        time: "",
        tags: [] as string[],
        user_id: "",
    });

    // Temp filters (while editing in modal)
    const [tempFilters, setTempFilters] = useState(activeFilters);

    useEffect(() => {
        const fetchTags = async () => {
            const { data } = await supabase.from("tags").select("*");
            if (data) setTags(data);
        };
        const fetchUsersWithRecipes = async () => {
            const usersWithRecipes = await getUsersWithRecipes();
            if (usersWithRecipes) setUsers(usersWithRecipes);
        };
        fetchUsersWithRecipes();
        fetchTags();
    }, []);

    // Handle search not immediately, not until apply
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const newFilters = { ...activeFilters, search: newValue };
        setTempFilters(newFilters);
    };

    const openFilters = () => {
        setTempFilters(activeFilters); // Reset temp to current active
        setIsOpen(true);
        // Prevent body scroll when modal is open on mobile
        if (window.innerWidth < 768) {
            document.body.style.overflow = 'hidden';
        }
    };

    const closeFilters = () => {
        setIsOpen(false);
        document.body.style.overflow = 'unset';
    };

    const applyFilters = () => {
        setActiveFilters(tempFilters);
        onFilterChange(tempFilters);
        closeFilters();
    };

    const clearFilters = () => {
        const cleared = {
            ...tempFilters,
            category: "",
            difficulty: "",
            time: "",
            tags: [],
            user_id: "",
        };
        setTempFilters(cleared);
    };

    const toggleTag = (tagId: string) => {
        const newTags = tempFilters.tags.includes(tagId)
            ? tempFilters.tags.filter((id) => id !== tagId)
            : [...tempFilters.tags, tagId];
        setTempFilters({ ...tempFilters, tags: newTags });
    };

    // Count active filters for badge
    const activeCount = [
        activeFilters.category,
        activeFilters.difficulty,
        activeFilters.time,
        activeFilters.tags.length > 0 ? 'tags' : ''
    ].filter(Boolean).length;

    return (
        <>
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm py-4 mb-6 -mx-4 px-4 border-b border-primary/10 dark:border-primary/20 transition-all">
                <div className="flex gap-2 max-w-6xl mx-auto w-full">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Buscar recetas..."
                            value={tempFilters.search}
                            onChange={handleSearchChange}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            className="border-primary/20 focus-visible:ring-primary bg-card"
                        />
                        <button
                            onClick={applyFilters}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary [@media(hover:hover)]:hover:text-primary/80"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                    <Button
                        variant="outline"
                        onClick={openFilters}
                        className={`border-primary/20 text-primary [@media(hover:hover)]:hover:bg-primary/10 relative ${isOpen ? "bg-primary/10" : "bg-card"}`}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                        {activeCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                                {activeCount}
                            </span>
                        )}
                    </Button>
                </div>
                {activeFilters.search && (
                    <div className="flex items-center gap-2 sticky top-16 z-20 bg-background/95 backdrop-blur-sm py-2 mb-6 -mx-4 px-4 border-b border-primary/10 dark:border-primary/20 transition-all">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Búsqueda:</span>
                            <span className="text-sm font-semibold">{activeFilters.search}</span>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setActiveFilters({ ...activeFilters, search: "" });
                                onFilterChange({ ...activeFilters, search: "" });
                            }}
                            className="ml-2 [@media(hover:hover)]:hover:bg-primary/10 [@media(hover:hover)]:hover:text-primary rounded-full"
                        >
                            <Trash className="h-4 w-4 text-primary [@media(hover:hover)]:hover:text-primary" />
                        </Button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeFilters}
                            className="fixed inset-0 bg-black/20 z-40 md:bg-transparent"
                        />

                        {/* Filter Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`
                                fixed inset-0 z-50 bg-card flex flex-col
                                md:absolute md:inset-auto md:top-20 md:right-0 md:w-96 md:h-auto md:max-h-[80vh] md:rounded-xl md:border md:border-primary/10 md:dark:border-primary/20 md:shadow-xl
                            `}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center p-4 border-b border-primary/10 dark:border-primary/20">
                                <h3 className="font-bold text-lg text-foreground">Filtros</h3>
                                <Button variant="ghost" size="icon" onClick={closeFilters} className="rounded-full [@media(hover:hover)]:hover:bg-muted">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-3">Categoría</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setTempFilters({ ...tempFilters, category: "" })}
                                            className={`p-2 text-sm rounded-lg border transition-all ${!tempFilters.category
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "border-border [@media(hover:hover)]:hover:border-primary/30 text-muted-foreground"
                                                }`}
                                        >
                                            Todas
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setTempFilters({ ...tempFilters, category: cat.id })}
                                                className={`p-2 text-sm rounded-lg border transition-all ${tempFilters.category === cat.id
                                                    ? "bg-primary/10 border-primary text-primary"
                                                    : "border-border [@media(hover:hover)]:hover:border-primary/30 text-muted-foreground"
                                                    }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {users.length > 0 &&
                                    <div className="flex items-left gap-2 flex-col">
                                        <label className="block text-sm font-bold text-foreground mb-3">Usuario</label>
                                        <UserSelect
                                            className="w-full"
                                            users={users}
                                            value={tempFilters.user_id}
                                            onChange={(value) => setTempFilters({ ...tempFilters, user_id: value === "all" ? "" : value })}
                                        />
                                    </div>}
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-3">Dificultad</label>
                                    <div className="flex gap-2">
                                        {['easy', 'medium', 'hard'].map((diff) => (
                                            <button
                                                key={diff}
                                                onClick={() => setTempFilters({ ...tempFilters, difficulty: tempFilters.difficulty === diff ? "" : diff })}
                                                className={`flex-1 p-2 text-sm rounded-lg border transition-all capitalize ${tempFilters.difficulty === diff
                                                    ? "bg-primary/10 border-primary text-primary"
                                                    : "border-border [@media(hover:hover)]:hover:border-primary/30 text-muted-foreground"
                                                    }`}
                                            >
                                                {diff === 'easy' ? 'Fácil' : diff === 'medium' ? 'Media' : 'Difícil'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-3">Tiempo</label>
                                    <div className="space-y-2">
                                        {[
                                            { val: 'fast', label: 'Rápidas (< 20 min)' },
                                            { val: 'medium', label: 'Medias (20-60 min)' },
                                            { val: 'slow', label: 'Largas (> 60 min)' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.val}
                                                onClick={() => setTempFilters({ ...tempFilters, time: tempFilters.time === opt.val ? "" : opt.val })}
                                                className={`w-full p-3 text-left text-sm rounded-lg border transition-all flex justify-between items-center ${tempFilters.time === opt.val
                                                    ? "bg-primary/10 border-primary text-primary"
                                                    : "border-border [@media(hover:hover)]:hover:border-primary/30 text-muted-foreground"
                                                    }`}
                                            >
                                                {opt.label}
                                                {tempFilters.time === opt.val && <Check className="h-4 w-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-3">Etiquetas</label>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                onClick={() => toggleTag(tag.id)}
                                                className={`px-3 py-1.5 rounded-full text-xs transition-colors border ${tempFilters.tags.includes(tag.id)
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-card text-muted-foreground border-border [@media(hover:hover)]:hover:border-primary/30"
                                                    }`}
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-primary/10 dark:border-primary/20 flex gap-3 bg-card md:rounded-b-xl">
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="flex-1 border-border text-muted-foreground [@media(hover:hover)]:hover:bg-muted"
                                >
                                    Limpiar
                                </Button>
                                <Button
                                    onClick={applyFilters}
                                    className="flex-[2] bg-primary [@media(hover:hover)]:hover:bg-primary/90 text-primary-foreground"
                                >
                                    Aplicar Filtros
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )
                }
            </AnimatePresence >
        </>
    );
}
