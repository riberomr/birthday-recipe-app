"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

import { RecipeCategory } from "@/types";

interface FilterBarProps {
    categories: RecipeCategory[];
    onFilterChange: (filters: any) => void;
}

export function FilterBar({ categories, onFilterChange }: FilterBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tags, setTags] = useState<{ id: string; name: string; type: string }[]>([]);
    const [filters, setFilters] = useState({
        search: "",
        category: "",
        difficulty: "",
        time: "", // 'fast' (< 20 mins)
        tags: [] as string[],
    });

    useEffect(() => {
        const fetchTags = async () => {
            const { data } = await supabase.from("tags").select("*");
            if (data) setTags(data);
        };
        fetchTags();
    }, []);

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const toggleTag = (tagId: string) => {
        const newTags = filters.tags.includes(tagId)
            ? filters.tags.filter((id) => id !== tagId)
            : [...filters.tags, tagId];
        handleFilterChange({ ...filters, tags: newTags });
    };

    return (
        <div className="mb-8 space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Buscar recetas..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                        className="pl-10 border-pink-200 focus-visible:ring-pink-400"
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`border-pink-200 text-pink-500 hover:bg-pink-50 ${isOpen ? "bg-pink-50" : ""}`}
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                </Button>
            </div>

            {isOpen && (
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-pink-100 dark:border-pink-900 shadow-sm space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Filtros Avanzados</h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Categoría</label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
                                className="w-full rounded-md border border-pink-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 dark:bg-zinc-800 dark:border-pink-900"
                            >
                                <option value="">Todas</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Dificultad</label>
                            <select
                                value={filters.difficulty}
                                onChange={(e) => handleFilterChange({ ...filters, difficulty: e.target.value })}
                                className="w-full rounded-md border border-pink-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 dark:bg-zinc-800 dark:border-pink-900"
                            >
                                <option value="">Todas</option>
                                <option value="easy">Fácil</option>
                                <option value="medium">Media</option>
                                <option value="hard">Difícil</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tiempo</label>
                            <select
                                value={filters.time}
                                onChange={(e) => handleFilterChange({ ...filters, time: e.target.value })}
                                className="w-full rounded-md border border-pink-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 dark:bg-zinc-800 dark:border-pink-900"
                            >
                                <option value="">Cualquier duración</option>
                                <option value="fast">Rápidas (&lt; 20 min)</option>
                                <option value="medium">Medias (20-60 min)</option>
                                <option value="slow">Largas (&gt; 60 min)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Etiquetas</label>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-3 py-1 rounded-full text-xs transition-colors border ${filters.tags.includes(tag.id)
                                        ? "bg-pink-500 text-white border-pink-500"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-pink-300 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700"
                                        }`}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
