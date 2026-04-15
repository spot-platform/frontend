import { withSerwist } from '@serwist/turbopack';

export default withSerwist({
    transpilePackages: ['@frontend/design-system'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
        ],
    },
});
