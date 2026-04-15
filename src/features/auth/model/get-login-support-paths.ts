import { getAuthPathWithNext } from './get-auth-path-with-next';

export function getLoginSupportPaths(nextPath?: string) {
    const buildPath = (hash: 'help' | 'support') => {
        const search = new URLSearchParams();

        if (nextPath) {
            search.set('next', nextPath);
        }

        const query = search.toString();
        return query ? `/login?${query}#${hash}` : `/login#${hash}`;
    };

    return {
        helpPath: buildPath('help'),
        signupPath: getAuthPathWithNext('/signup', nextPath),
        supportPath: buildPath('support'),
    };
}
