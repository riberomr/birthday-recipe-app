"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, ChefHat, Clock, Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/AuthContext"
import { useSnackbar } from "@/components/ui/Snackbar"
import { compressImage } from "@/lib/utils"
import { createRecipe, updateRecipe } from "@/lib/api/recipes"
import { Recipe } from "@/types"

interface RecipeFormProps {
    initialData?: Recipe
    isEditing?: boolean
}

export function RecipeForm({ initialData, isEditing = false }: RecipeFormProps) {
    const router = useRouter()
    const { user, supabaseUser } = useAuth()
    const { showSnackbar } = useSnackbar()
    const [loading, setLoading] = useState(false)

    const [tags, setTags] = useState<{ id: string, name: string }[]>([])
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url || null)

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        prep_time: initialData?.prep_time_minutes?.toString() || "",
        cook_time: initialData?.cook_time_minutes?.toString() || "",
        difficulty: initialData?.difficulty || "medium",
        servings: initialData?.servings?.toString() || "4",
        selectedTags: initialData?.tags?.map(t => t.id) || [] as string[],
        ingredients: initialData?.recipe_ingredients?.map(ing => ({
            name: ing.name,
            amount: ing.amount || "",
            optional: ing.optional
        })) || [{ name: "", amount: "", optional: false }],
        steps: initialData?.recipe_steps?.map(step => ({
            content: step.content
        })) || [{ content: "" }],
        nutrition: initialData?.recipe_nutrition?.map(nut => ({
            name: nut.name,
            amount: nut.amount,
            unit: nut.unit || ""
        })) || [{ name: "", amount: "", unit: "" }]
    })

    useEffect(() => {
        const fetchTags = async () => {
            const { data } = await supabase.from("tags").select("*")
            if (data) setTags(data)
        }
        fetchTags()
    }, [])

    // Protect Edit Route
    useEffect(() => {
        if (isEditing && initialData && supabaseUser && supabaseUser.id !== initialData.user_id) {
            router.push("/")
            showSnackbar("No tienes permiso para editar esta receta", "error")
        }
    }, [supabaseUser, initialData, isEditing, router, showSnackbar])

    // Cleanup preview URL on unmount or when image changes
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl !== initialData?.image_url) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl, initialData])

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedImage(file)

            // Create preview URL
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const clearImage = () => {
        setSelectedImage(null)
        setPreviewUrl(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            showSnackbar("Debes iniciar sesión para crear una receta", "error")
            return
        }

        // Custom Validation
        const validIngredients = formData.ingredients.filter(ing => ing.name.trim() !== "")
        if (validIngredients.length === 0) {
            showSnackbar("Agrega al menos un ingrediente", "error")
            return
        }

        const validSteps = formData.steps.filter(step => step.content.trim() !== "")
        if (validSteps.length === 0) {
            showSnackbar("Agrega al menos un paso de preparación", "error")
            return
        }

        setLoading(true)

        try {
            const submitData = new FormData()
            submitData.append('title', formData.title)
            submitData.append('description', formData.description)
            submitData.append('prep_time', formData.prep_time)
            submitData.append('cook_time', formData.cook_time)
            submitData.append('difficulty', formData.difficulty)
            submitData.append('servings', formData.servings)
            submitData.append('user_id', supabaseUser?.id!)

            let finalFile = selectedImage
            // Append file if selected
            if (selectedImage) {
                finalFile = await compressImage(selectedImage)
                submitData.append('file', finalFile)
            } else if (isEditing && previewUrl === initialData?.image_url) {
                // If editing and image hasn't changed, we don't send file, but we might need to signal to keep existing
                submitData.append('keep_image', 'true')
            }

            // Append complex objects as JSON strings
            submitData.append('ingredients', JSON.stringify(formData.ingredients.filter(ing => ing.name.trim())))
            submitData.append('steps', JSON.stringify(formData.steps.filter(step => step.content.trim())))
            submitData.append('nutrition', JSON.stringify(formData.nutrition.filter(item => item.name.trim() && item.amount.trim())))
            submitData.append('tags', JSON.stringify(formData.selectedTags))

            let result;
            if (isEditing && initialData) {
                result = await updateRecipe(initialData.id, submitData)
                showSnackbar("Receta actualizada con éxito", "success")
            } else {
                result = await createRecipe(submitData)
                showSnackbar("Receta creada con éxito", "success")
            }

            router.push(`/recipes/${result.recipeId}`)
            router.refresh()
        } catch (error: any) {
            console.error("Error saving recipe:", error)
            showSnackbar(error.message || "Error al guardar la receta. Por favor intenta de nuevo.", "error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto p-6 bg-card rounded-3xl shadow-xl border-4 border-border">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-primary mb-2">
                    {isEditing ? "Editar Receta ✏️" : "Nueva Receta Mágica ✨"}
                </h2>
                <p className="text-muted-foreground">
                    {isEditing ? "Actualiza tu creación" : "Comparte tu dulzura con el mundo"}
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Título de la Receta</label>
                    <Input
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej: Pastel de Fresas Kawaii"
                        className="text-lg border-input focus-visible:ring-ring"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
                    <Textarea
                        required
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Cuéntanos un poco sobre esta delicia..."
                        className="border-input focus-visible:ring-ring"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            <Clock className="inline w-4 h-4 mr-1" /> Prep (min)
                        </label>
                        <Input
                            required
                            type="number"
                            value={formData.prep_time}
                            onChange={e => setFormData({ ...formData, prep_time: e.target.value })}
                            className="border-input focus-visible:ring-ring"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            <ChefHat className="inline w-4 h-4 mr-1" /> Cocción (min)
                        </label>
                        <Input
                            required
                            type="number"
                            value={formData.cook_time}
                            onChange={e => setFormData({ ...formData, cook_time: e.target.value })}
                            className="border-input focus-visible:ring-ring"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Imagen de la Receta</label>
                    <div className="space-y-4">
                        {!previewUrl ? (
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-input border-dashed rounded-2xl cursor-pointer bg-muted [@media(hover:hover)]:hover:bg-accent transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                                    <Camera className="w-12 h-12 mb-3" />
                                    <p className="mb-2 text-sm font-semibold">
                                        <span className="font-bold">Haz clic para subir</span> o arrastra y suelta
                                    </p>
                                    <p className="text-xs">SVG, PNG, JPG or GIF</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        ) : (
                            <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-border shadow-md group">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={clearImage}
                                        className="rounded-full"
                                    >
                                        <Trash2 className="w-5 h-5 mr-2" />
                                        Eliminar Imagen
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Dificultad</label>
                        <select
                            value={formData.difficulty}
                            onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                            className="w-full rounded-md border border-input bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="easy">Fácil</option>
                            <option value="medium">Media</option>
                            <option value="hard">Difícil</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Porciones</label>
                        <Input
                            type="number"
                            value={formData.servings}
                            onChange={e => setFormData({ ...formData, servings: e.target.value })}
                            className="border-input focus-visible:ring-ring"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Etiquetas</label>
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
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground [@media(hover:hover)]:hover:bg-accent"
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
                    <h3 className="text-xl font-bold text-primary">Ingredientes</h3>
                    <Button type="button" onClick={addIngredient} variant="outline" size="sm" className="text-primary border-primary/20 [@media(hover:hover)]:hover:bg-primary/10">
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
                            className="flex-1 border-input"
                        />
                        <Input
                            placeholder="Cant."
                            value={ing.amount}
                            onChange={e => {
                                const newIngs = [...formData.ingredients]
                                newIngs[idx].amount = e.target.value
                                setFormData({ ...formData, ingredients: newIngs })
                            }}
                            className="w-24 border-input"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(idx)} className="text-destructive [@media(hover:hover)]:hover:text-destructive [@media(hover:hover)]:hover:bg-destructive/10" data-testid={`remove-ingredient-${idx}`}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-primary">Pasos</h3>
                    <Button type="button" onClick={addStep} variant="outline" size="sm" className="text-primary border-primary/20 [@media(hover:hover)]:hover:bg-primary/10">
                        <Plus className="w-4 h-4 mr-1" /> Agregar
                    </Button>
                </div>
                {formData.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold shrink-0">
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
                            className="flex-1 border-input"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(idx)} className="text-destructive [@media(hover:hover)]:hover:text-destructive [@media(hover:hover)]:hover:bg-destructive/10" data-testid={`remove-step-${idx}`}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-primary">Información Nutricional</h3>
                    <Button type="button" onClick={addNutrition} variant="outline" size="sm" className="text-primary border-primary/20 [@media(hover:hover)]:hover:bg-primary/10">
                        <Plus className="w-4 h-4 mr-1" /> Agregar
                    </Button>
                </div>
                {formData.nutrition.map((item, idx) => (
                    <div key={idx} className="flex gap-2 sm:flex-row flex-col">
                        <Input
                            placeholder="Nombre (ej: Calorías)"
                            value={item.name}
                            onChange={e => {
                                const newNut = [...formData.nutrition]
                                newNut[idx].name = e.target.value
                                setFormData({ ...formData, nutrition: newNut })
                            }}
                            className="flex-1 border-input "
                        />
                        <div className="flex gap-2 justify-between">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Valor"
                                    value={item.amount}
                                    onChange={e => {
                                        const newNut = [...formData.nutrition]
                                        newNut[idx].amount = e.target.value
                                        setFormData({ ...formData, nutrition: newNut })
                                    }}
                                    className="w-24 border-input "
                                />
                                <Input
                                    placeholder="Unidad"
                                    value={item.unit}
                                    onChange={e => {
                                        const newNut = [...formData.nutrition]
                                        newNut[idx].unit = e.target.value
                                        setFormData({ ...formData, nutrition: newNut })
                                    }}
                                    className="w-20 border-input "
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeNutrition(idx)} className="flex-end text-destructive [@media(hover:hover)]:hover:text-destructive [@media(hover:hover)]:hover:bg-destructive/10" data-testid={`remove-nutrition-${idx}`}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 mt-8 border-t border-border">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="h-14 text-sm border-2 border-input text-muted-foreground [@media(hover:hover)]:hover:bg-accent [@media(hover:hover)]:hover:text-accent-foreground"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="h-14 text-sm bg-primary [@media(hover:hover)]:hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all [@media(hover:hover)]:hover:scale-[1.02] active:scale-[0.98]"
                    disabled={loading}
                >
                    {loading ? "Guardando..." : (
                        <>
                            {isEditing ? "Actualizar Receta" : "Guardar Receta"}
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
