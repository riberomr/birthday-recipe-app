"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, ChefHat, Clock, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/AuthContext"
import { useSnackbar } from "@/components/ui/Snackbar"

export function RecipeForm() {
    const router = useRouter()
    const { user } = useAuth()
    const { showSnackbar } = useSnackbar()
    const [loading, setLoading] = useState(false)

    const [tags, setTags] = useState<{ id: string, name: string }[]>([])
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        prep_time: "",
        cook_time: "",
        image_url: "",
        difficulty: "medium",
        servings: "4",
        selectedTags: [] as string[],
        ingredients: [{ name: "", amount: "", optional: false }],
        steps: [{ content: "" }],
        nutrition: [{ name: "", amount: "", unit: "" }]
    })

    useEffect(() => {
        const fetchTags = async () => {
            const { data } = await supabase.from("tags").select("*")
            if (data) setTags(data)
        }
        fetchTags()
    }, [])

    const addIngredient = () => {
        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, { name: "", amount: "", optional: false }]
        })
    }

    const removeIngredient = (index: number) => {
        const newIngredients = [...formData.ingredients]
        newIngredients.splice(index, 1)
        setFormData({ ...formData, ingredients: newIngredients })
    }

    const addStep = () => {
        setFormData({
            ...formData,
            steps: [...formData.steps, { content: "" }]
        })
    }

    const removeStep = (index: number) => {
        const newSteps = [...formData.steps]
        newSteps.splice(index, 1)
        setFormData({ ...formData, steps: newSteps })
    }

    const addNutrition = () => {
        setFormData({
            ...formData,
            nutrition: [...formData.nutrition, { name: "", amount: "", unit: "" }]
        })
    }

    const removeNutrition = (index: number) => {
        const newNutrition = [...formData.nutrition]
        newNutrition.splice(index, 1)
        setFormData({ ...formData, nutrition: newNutrition })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            showSnackbar("Debes iniciar sesión para crear una receta", "error")
            return
        }

        setLoading(true)

        try {
            // Insert recipe
            const { data: recipe, error: recipeError } = await supabase
                .from("recipes")
                .insert({
                    title: formData.title,
                    description: formData.description,
                    prep_time_minutes: parseInt(formData.prep_time) || 0,
                    cook_time_minutes: parseInt(formData.cook_time) || 0,
                    image_url: formData.image_url || null,
                    difficulty: formData.difficulty,
                    servings: parseInt(formData.servings) || 4,
                    user_id: user.id
                })
                .select()
                .single()

            if (recipeError) throw recipeError

            // Insert ingredients
            const ingredientsToInsert = formData.ingredients
                .filter(ing => ing.name.trim())
                .map(ing => ({
                    recipe_id: recipe.id,
                    name: ing.name,
                    amount: ing.amount || null,
                    optional: ing.optional
                }))

            if (ingredientsToInsert.length > 0) {
                const { error: ingredientsError } = await supabase
                    .from("recipe_ingredients")
                    .insert(ingredientsToInsert)

                if (ingredientsError) throw ingredientsError
            }

            // Insert steps
            const stepsToInsert = formData.steps
                .filter(step => step.content.trim())
                .map((step, index) => ({
                    recipe_id: recipe.id,
                    step_order: index + 1,
                    content: step.content
                }))

            if (stepsToInsert.length > 0) {
                const { error: stepsError } = await supabase
                    .from("recipe_steps")
                    .insert(stepsToInsert)

                if (stepsError) throw stepsError
            }

            // Insert nutrition
            const nutritionToInsert = formData.nutrition
                .filter(item => item.name.trim() && item.amount.trim())
                .map(item => ({
                    recipe_id: recipe.id,
                    name: item.name,
                    amount: item.amount,
                    unit: item.unit || null
                }))

            if (nutritionToInsert.length > 0) {
                const { error: nutritionError } = await supabase
                    .from("recipe_nutrition")
                    .insert(nutritionToInsert)

                if (nutritionError) throw nutritionError
            }

            // Insert tags
            if (formData.selectedTags.length > 0) {
                const tagsToInsert = formData.selectedTags.map(tagId => ({
                    recipe_id: recipe.id,
                    tag_id: tagId
                }))

                const { error: tagsError } = await supabase
                    .from("recipe_tags")
                    .insert(tagsToInsert)

                if (tagsError) throw tagsError
            }

            router.push(`/recipes/${recipe.id}`)
        } catch (error) {
            console.error("Error creating recipe:", error)
            showSnackbar("Error al crear la receta. Por favor intenta de nuevo.", "error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border-4 border-pink-100 dark:border-pink-900">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-pink-500 mb-2">Nueva Receta Mágica ✨</h2>
                <p className="text-gray-500">Comparte tu dulzura con el mundo</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título de la Receta</label>
                    <Input
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej: Pastel de Fresas Kawaii"
                        className="text-lg border-pink-200 focus-visible:ring-pink-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                    <Textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Cuéntanos un poco sobre esta delicia..."
                        className="border-pink-200 focus-visible:ring-pink-400"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Clock className="inline w-4 h-4 mr-1" /> Prep (min)
                        </label>
                        <Input
                            type="number"
                            value={formData.prep_time}
                            onChange={e => setFormData({ ...formData, prep_time: e.target.value })}
                            className="border-pink-200 focus-visible:ring-pink-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <ChefHat className="inline w-4 h-4 mr-1" /> Cocción (min)
                        </label>
                        <Input
                            type="number"
                            value={formData.cook_time}
                            onChange={e => setFormData({ ...formData, cook_time: e.target.value })}
                            className="border-pink-200 focus-visible:ring-pink-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL de la Imagen</label>
                    <Input
                        value={formData.image_url}
                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://..."
                        className="border-pink-200 focus-visible:ring-pink-400"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dificultad</label>
                        <select
                            value={formData.difficulty || "medium"}
                            onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                            className="w-full rounded-md border border-pink-200 p-2 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:bg-zinc-800 dark:border-pink-900"
                        >
                            <option value="easy">Fácil</option>
                            <option value="medium">Media</option>
                            <option value="hard">Difícil</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Porciones</label>
                        <Input
                            type="number"
                            value={formData.servings}
                            onChange={e => setFormData({ ...formData, servings: e.target.value })}
                            className="border-pink-200 focus-visible:ring-pink-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Etiquetas</label>
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => {
                                    const newTags = formData.selectedTags.includes(tag.id)
                                        ? formData.selectedTags.filter(id => id !== tag.id)
                                        : [...formData.selectedTags, tag.id]
                                    setFormData({ ...formData, selectedTags: newTags })
                                }}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${formData.selectedTags.includes(tag.id)
                                        ? "bg-pink-500 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-400"
                                    }`}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-pink-500">Ingredientes</h3>
                    <Button type="button" onClick={addIngredient} variant="outline" size="sm" className="text-pink-500 border-pink-200 hover:bg-pink-50">
                        <Plus className="w-4 h-4 mr-1" /> Agregar
                    </Button>
                </div>
                {formData.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2">
                        <Input
                            placeholder="Ingrediente"
                            value={ing.name}
                            onChange={e => {
                                const newIngs = [...formData.ingredients]
                                newIngs[idx].name = e.target.value
                                setFormData({ ...formData, ingredients: newIngs })
                            }}
                            className="flex-1 border-pink-200"
                        />
                        <Input
                            placeholder="Cant."
                            value={ing.amount}
                            onChange={e => {
                                const newIngs = [...formData.ingredients]
                                newIngs[idx].amount = e.target.value
                                setFormData({ ...formData, ingredients: newIngs })
                            }}
                            className="w-24 border-pink-200"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-500 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-pink-500">Pasos</h3>
                    <Button type="button" onClick={addStep} variant="outline" size="sm" className="text-pink-500 border-pink-200 hover:bg-pink-50">
                        <Plus className="w-4 h-4 mr-1" /> Agregar
                    </Button>
                </div>
                {formData.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-600 font-bold shrink-0">
                            {idx + 1}
                        </span>
                        <Textarea
                            placeholder={`Paso ${idx + 1}`}
                            value={step.content}
                            onChange={e => {
                                const newSteps = [...formData.steps]
                                newSteps[idx].content = e.target.value
                                setFormData({ ...formData, steps: newSteps })
                            }}
                            className="flex-1 border-pink-200"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(idx)} className="text-red-400 hover:text-red-500 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-pink-500">Información Nutricional</h3>
                    <Button type="button" onClick={addNutrition} variant="outline" size="sm" className="text-pink-500 border-pink-200 hover:bg-pink-50">
                        <Plus className="w-4 h-4 mr-1" /> Agregar
                    </Button>
                </div>
                {formData.nutrition.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                        <Input
                            placeholder="Nombre (ej: Calorías)"
                            value={item.name}
                            onChange={e => {
                                const newNut = [...formData.nutrition]
                                newNut[idx].name = e.target.value
                                setFormData({ ...formData, nutrition: newNut })
                            }}
                            className="flex-1 border-pink-200"
                        />
                        <Input
                            placeholder="Valor"
                            value={item.amount}
                            onChange={e => {
                                const newNut = [...formData.nutrition]
                                newNut[idx].amount = e.target.value
                                setFormData({ ...formData, nutrition: newNut })
                            }}
                            className="w-24 border-pink-200"
                        />
                        <Input
                            placeholder="Unidad"
                            value={item.unit}
                            onChange={e => {
                                const newNut = [...formData.nutrition]
                                newNut[idx].unit = e.target.value
                                setFormData({ ...formData, nutrition: newNut })
                            }}
                            className="w-20 border-pink-200"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeNutrition(idx)} className="text-red-400 hover:text-red-500 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-zinc-800"
                >
                    <X className="w-5 h-5 mr-2" />
                    Cancelar
                </Button>
                <Button type="submit" className="flex-[2] bg-pink-500 hover:bg-pink-600 text-white text-lg py-6 rounded-xl" disabled={loading}>
                    {loading ? "Guardando..." : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Guardar Receta
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
