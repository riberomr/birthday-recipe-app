
import { auth } from "@/lib/firebase/client";
import { Comment } from "@/types";

export async function getComments(recipeId: string, page: number = 1, limit: number = 5): Promise<{ comments: Comment[], total: number }> {
    const params = new URLSearchParams({
        recipeId,
        page: page.toString(),
        limit: limit.toString()
    });

    try {
        const response = await fetch(`/api/comments?${params.toString()}`);

        if (!response.ok) {
            console.error("Error fetching comments");
            return { comments: [], total: 0 };
        }

        const { data } = await response.json();
        return { comments: data.comments || [], total: data.total || 0 };
    } catch (error) {
        console.error("Error fetching or parsing comments:", error);
        return { comments: [], total: 0 };
    }
}

export async function postComment(formData: FormData): Promise<Comment> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Usuario no autenticado");
    }

    const token = await user.getIdToken();

    try {
        const response = await fetch(`/api/comments/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        let result;
        try {
            result = await response.json();
        } catch (error) {
            throw new Error('Error al procesar la respuesta del servidor');
        }

        if (!response.ok) {
            throw new Error(result.error || 'Error al publicar comentario');
        }

        return result.comment;
    } catch (error: any) {
        throw new Error(error.message || 'Error al publicar comentario');
    }
}

export async function deleteComment(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const token = await user.getIdToken();

    try {
        const response = await fetch(`/api/comments/${id}/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        let result;
        try {
            result = await response.json();
        } catch (error) {
            throw new Error('Error al procesar la respuesta del servidor');
        }

        if (!response.ok) {
            throw new Error(result.error || 'Error desconocido al eliminar el comentario');
        }
    } catch (error: any) {
        throw new Error(error.message || 'Error desconocido al eliminar el comentario');
    }
}
