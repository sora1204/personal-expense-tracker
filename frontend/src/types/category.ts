export type Category = {
    id: number;
    name: string;
    owner_id: number;
    created_at: string;
};

export type CategoryCreateRequest = {
    name: string;
};

export type CategoryUpdateRequest = {
    name?: string;
};