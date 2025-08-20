import referenePronunciationRepositories from "../repositories/reference-pronunciation.repository";
import { ReferencePronunciationAttributes } from "../../../shared/databaseTypes/pronunciation-feedback-types";
import { v4 } from "uuid";

export const handleSinglePronunciation = async (data: ReferencePronunciationAttributes) => {
    try {
        const existing = await referenePronunciationRepositories.getPronunciationByEnglishWord(data.englishWord);

        if (existing) {
            const updated = await referenePronunciationRepositories.updatePronunciation({
                ...existing.toJSON(),
                ...data,
            },
                { id: existing?.id }
            );
            return { type: "updated", result: updated };
        } else {
            const created = await referenePronunciationRepositories.addPronunciation({
                ...data,
                id: v4(),
                createdAt: new Date(),
            });
            return { type: "created", result: created };
        }
    } catch (error: any) {
        return { type: "error", result: { data, reason: error?.message || "Unknown error" } };
    }
};