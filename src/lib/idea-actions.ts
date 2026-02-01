'use server';

import { auth } from "@/lib/auth";
import { ideasService } from "./services/ideas-service";
import { revalidatePath } from "next/cache";
import { Idea } from "./types";

export async function getIdeasAction() {
    const session = await auth();
    if (!session?.user?.id) return [];
    return await ideasService.getAll(session.user.id);
}

export async function createIdeaAction(data: { content: string; type: Idea['type']; tags?: string[] }) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const newIdea = await ideasService.create({
            userId: session.user.id,
            content: data.content,
            type: data.type,
            status: 'active',
            tags: data.tags || [],
            priority: 'medium',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        revalidatePath('/ideas');
        return { success: true, data: newIdea };
    } catch (error) {
        return { success: false, error: "Failed to create idea" };
    }
}

export async function updateIdeaStatusAction(id: string, status: Idea['status']) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await ideasService.update(id, {
            status,
            updatedAt: new Date().toISOString()
        });
        revalidatePath('/ideas');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update idea" };
    }
}

export async function deleteIdeaAction(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await ideasService.delete(id);
        revalidatePath('/ideas');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete idea" };
    }
}
