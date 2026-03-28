const requiredPublic = {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
} as const;

function assertEnv<T extends Record<string, string | undefined>>(
    vars: T,
): asserts vars is T & { [K in keyof T]: string } {
    const missing = Object.entries(vars)
        .filter(([, v]) => !v)
        .map(([k]) => k);
    if (missing.length > 0) {
        throw new Error(`Missing env vars: ${missing.join(', ')}`);
    }
}

assertEnv(requiredPublic);

export const env = requiredPublic as {
    [K in keyof typeof requiredPublic]: string;
};
