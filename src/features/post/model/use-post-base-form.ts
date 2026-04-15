'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { PostSpotCategory } from './types';

const DRAFT_KEY = 'post-base-form-draft';
const EMPTY_DRAFT: BaseFormDraft = {
    spotName: '',
    title: '',
    content: '',
    categories: [],
    location: '',
    deadline: '',
};

interface BaseFormDraft {
    spotName: string;
    title: string;
    content: string;
    categories: PostSpotCategory[];
    location: string;
    deadline: string;
}

function getInitialDraft(): BaseFormDraft {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);

        if (!raw) {
            return EMPTY_DRAFT;
        }

        const draft = JSON.parse(raw) as Partial<BaseFormDraft>;

        return {
            spotName: draft.spotName ?? '',
            title: draft.title ?? '',
            content: draft.content ?? '',
            categories: draft.categories ?? [],
            location: draft.location ?? '',
            deadline: draft.deadline ?? '',
        };
    } catch {
        return EMPTY_DRAFT;
    }
}

function subscribeToHydration() {
    return () => {};
}

export function usePostBaseForm() {
    const isHydrated = useSyncExternalStore(
        subscribeToHydration,
        () => true,
        () => false,
    );
    const initialDraft = isHydrated ? getInitialDraft() : EMPTY_DRAFT;
    const [draftOverride, setDraftOverride] = useState<BaseFormDraft | null>(
        null,
    );
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const draft = draftOverride ?? initialDraft;
    const { spotName, title, content, categories, location, deadline } = draft;

    // 자동 임시저장 (각 필드 변경 시)
    useEffect(() => {
        if (!isHydrated) {
            return;
        }

        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, [draft, isHydrated]);

    const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

    const handleAddPhoto = (_file: File, preview: string) => {
        setPhotoPreviews((prev) => [...prev, preview]);
    };

    const handleRemovePhoto = (index: number) => {
        setPhotoPreviews((prev) =>
            prev.filter((_, current) => current !== index),
        );
    };

    return {
        spotName,
        title,
        content,
        categories,
        photoPreviews,
        location,
        deadline,
        setSpotName: (value: string) =>
            setDraftOverride((prev) => ({
                ...(prev ?? initialDraft),
                spotName: value,
            })),
        setTitle: (value: string) =>
            setDraftOverride((prev) => ({
                ...(prev ?? initialDraft),
                title: value,
            })),
        setContent: (value: string) =>
            setDraftOverride((prev) => ({
                ...(prev ?? initialDraft),
                content: value,
            })),
        setCategories: (value: PostSpotCategory[]) =>
            setDraftOverride((prev) => ({
                ...(prev ?? initialDraft),
                categories: value,
            })),
        setLocation: (value: string) =>
            setDraftOverride((prev) => ({
                ...(prev ?? initialDraft),
                location: value,
            })),
        setDeadline: (value: string) =>
            setDraftOverride((prev) => ({
                ...(prev ?? initialDraft),
                deadline: value,
            })),
        handleAddPhoto,
        handleRemovePhoto,
        clearDraft,
    };
}
