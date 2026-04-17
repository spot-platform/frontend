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
    async redirects() {
        return [
            {
                source: '/feed',
                destination: '/map?sheet=half',
                permanent: false,
            },
            {
                source: '/search',
                destination: '/map?sheet=half',
                permanent: false,
            },
            {
                source: '/spot',
                destination: '/map?sheet=half',
                permanent: false,
            },
        ];
    },
});
