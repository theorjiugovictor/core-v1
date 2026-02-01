import { db, Collections } from "../firebase/config";
import { Idea } from "../types";

export const ideasService = {
    async getAll(userId: string): Promise<Idea[]> {
        try {
            const snapshot = await db
                .collection(Collections.IDEAS)
                .where("userId", "==", userId)
                .get();

            // Sort in memory
            const ideas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Idea));
            return ideas.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        } catch (error) {
            console.error("Error fetching ideas:", error);
            return [];
        }
    },

    async getById(id: string): Promise<Idea | null> {
        try {
            const doc = await db.collection(Collections.IDEAS).doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() } as Idea;
            }
            return null;
        } catch (error) {
            console.error("Error fetching idea by id:", error);
            return null;
        }
    },

    async create(idea: Omit<Idea, "id">) {
        try {
            // Ensure strictly serializable data
            const docRef = await db.collection(Collections.IDEAS).add(JSON.parse(JSON.stringify(idea)));
            return { id: docRef.id, ...idea };
        } catch (error) {
            console.error("Error creating idea:", error);
            throw error;
        }
    },

    async update(id: string, updates: Partial<Idea>) {
        try {
            await db.collection(Collections.IDEAS).doc(id).update(updates);
            return true;
        } catch (error) {
            console.error("Error updating idea:", error);
            throw error;
        }
    },

    async delete(id: string) {
        try {
            await db.collection(Collections.IDEAS).doc(id).delete();
            return true;
        } catch (error) {
            console.error("Error deleting idea:", error);
            throw error;
        }
    }
};
