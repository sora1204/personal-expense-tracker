export type RegisterRequest = {
    username: string;
    email: string;
    password: string;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type TokenResponse = {
    access_token: string;
    token_type: string;
};