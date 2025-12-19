"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, Check, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { RecipeCategory, SupabaseUser } from "@/types";
import { getUsersWithRecipes } from "@/lib/api/users";
import { UserSelect } from "./UserSelect";

interface FilterBarProps {
    categories: RecipeCategory[];
    onFilterChange: (filters: any) => void;
}

export function FilterBar({ categories, onFilterChange }: FilterBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tags, setTags] = useState<{ id: string; name: string; type: string }[]>([]);
    const [users, setUsers] = useState<SupabaseUser[]>([]);

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
            <div className="sticky top-0 z-30 bg-pink-50/95 dark:bg-zinc-950/95 backdrop-blur-sm py-4 mb-6 -mx-4 px-4 border-b border-pink-100 dark:border-pink-900/50 transition-all">
                <div className="flex gap-2 max-w-6xl mx-auto w-full">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Buscar recetas..."
                            value={tempFilters.search}
                            onChange={handleSearchChange}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            className="border-pink-200 focus-visible:ring-pink-400 bg-white dark:bg-zinc-900"
                        />
                        <button
                            onClick={applyFilters}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-500 [@media(hover:hover)]:hover:text-pink-600 dark:[@media(hover:hover)]:hover:text-pink-400"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                    <Button
                        variant="outline"
                        onClick={openFilters}
                        className={`border-pink-200 text-pink-500 [@media(hover:hover)]:hover:bg-pink-50 dark:[@media(hover:hover)]:hover:bg-pink-900/20 relative ${isOpen ? "bg-pink-50" : "bg-white dark:bg-zinc-900"}`}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                        {activeCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                                {activeCount}
                            </span>
                        )}
                    </Button>
                </div>
                {activeFilters.search && (
                    <div className="flex items-center gap-2 sticky top-16 z-20 bg-pink-50/95 dark:bg-zinc-950/95 backdrop-blur-sm py-2 mb-6 -mx-4 px-4 border-b border-pink-100 dark:border-pink-900/50 transition-all">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Búsqueda:</span>
                            <span className="text-sm font-semibold">{activeFilters.search}</span>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setActiveFilters({ ...activeFilters, search: "" });
                                onFilterChange({ ...activeFilters, search: "" });
                            }}
                            className="ml-2 [@media(hover:hover)]:hover:bg-pink-50 dark:[@media(hover:hover)]:hover:bg-pink-900/20 [@media(hover:hover)]:hover:text-pink-600 dark:[@media(hover:hover)]:hover:text-pink-500 rounded-full"
                        >
                            <Trash className="h-4 w-4 text-pink-500 dark:text-pink-600 [@media(hover:hover)]:hover:text-pink-600 dark:[@media(hover:hover)]:hover:text-pink-500" />
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
                                fixed inset-0 z-50 bg-white dark:bg-zinc-900 flex flex-col
                                md:absolute md:inset-auto md:top-20 md:right-0 md:w-96 md:h-auto md:max-h-[80vh] md:rounded-xl md:border md:border-pink-100 md:dark:border-pink-900 md:shadow-xl
                            `}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center p-4 border-b border-pink-100 dark:border-pink-900/50">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Filtros</h3>
                                <Button variant="ghost" size="icon" onClick={closeFilters} className="rounded-full [@media(hover:hover)]:hover:bg-gray-100 dark:[@media(hover:hover)]:hover:bg-zinc-800">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Categoría</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setTempFilters({ ...tempFilters, category: "" })}
                                            className={`p-2 text-sm rounded-lg border transition-all ${!tempFilters.category
                                                ? "bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300"
                                                : "border-gray-200 [@media(hover:hover)]:hover:border-pink-200 text-gray-600 dark:border-zinc-800 dark:text-gray-400"
                                                }`}
                                        >
                                            Todas
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setTempFilters({ ...tempFilters, category: cat.id })}
                                                className={`p-2 text-sm rounded-lg border transition-all ${tempFilters.category === cat.id
                                                    ? "bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300"
                                                    : "border-gray-200 [@media(hover:hover)]:hover:border-pink-200 text-gray-600 dark:border-zinc-800 dark:text-gray-400"
                                                    }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {users.length > 0 &&
                                    <div className="flex items-left gap-2 flex-col">
                                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Usuario</label>
                                        <UserSelect
                                            className="w-full"
                                            users={users}
                                            value={tempFilters.user_id}
                                            onChange={(value) => setTempFilters({ ...tempFilters, user_id: value === "all" ? "" : value })}
                                        />
                                    </div>}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Dificultad</label>
                                    <div className="flex gap-2">
                                        {['easy', 'medium', 'hard'].map((diff) => (
                                            <button
                                                key={diff}
                                                onClick={() => setTempFilters({ ...tempFilters, difficulty: tempFilters.difficulty === diff ? "" : diff })}
                                                className={`flex-1 p-2 text-sm rounded-lg border transition-all capitalize ${tempFilters.difficulty === diff
                                                    ? "bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300"
                                                    : "border-gray-200 [@media(hover:hover)]:hover:border-pink-200 text-gray-600 dark:border-zinc-800 dark:text-gray-400"
                                                    }`}
                                            >
                                                {diff === 'easy' ? 'Fácil' : diff === 'medium' ? 'Media' : 'Difícil'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Tiempo</label>
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
                                                    ? "bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300"
                                                    : "border-gray-200 [@media(hover:hover)]:hover:border-pink-200 text-gray-600 dark:border-zinc-800 dark:text-gray-400"
                                                    }`}
                                            >
                                                {opt.label}
                                                {tempFilters.time === opt.val && <Check className="h-4 w-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Etiquetas</label>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                onClick={() => toggleTag(tag.id)}
                                                className={`px-3 py-1.5 rounded-full text-xs transition-colors border ${tempFilters.tags.includes(tag.id)
                                                    ? "bg-pink-500 text-white border-pink-500"
                                                    : "bg-white text-gray-600 border-gray-200 [@media(hover:hover)]:hover:border-pink-300 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700"
                                                    }`}
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-pink-100 dark:border-pink-900/50 flex gap-3 bg-white dark:bg-zinc-900 md:rounded-b-xl">
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="flex-1 border-gray-200 text-gray-600 [@media(hover:hover)]:hover:bg-gray-50 dark:border-zinc-800 dark:text-gray-400"
                                >
                                    Limpiar
                                </Button>
                                <Button
                                    onClick={applyFilters}
                                    className="flex-[2] bg-pink-500 [@media(hover:hover)]:hover:bg-pink-600 text-white"
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
