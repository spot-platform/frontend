import localFont from 'next/font/local';

// App-scoped A2Z font family loaded via Next.js local font loader
// Maps the 9 font files in public/ to the standard 100-900 weight scale.
// Exposes a CSS variable (--font-a2z) for later root/global wiring.
export const A2Z = localFont({
    src: [
        {
            path: '../../../public/에이투지체-1Thin.ttf',
            weight: '100',
            style: 'normal',
        },
        {
            path: '../../../public/에이투지체-2ExtraLight.ttf',
            weight: '200',
            style: 'normal',
        },
        {
            path: '../../../public/에이투지체-3Light.ttf',
            weight: '300',
            style: 'normal',
        },
        {
            path: '../../../public/에이투지체-4Regular.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../../../public/에이투지체-5Medium.ttf',
            weight: '500',
            style: 'normal',
        },
        {
            path: '../../../public/에이투지체-6SemiBold.ttf',
            weight: '600',
            style: 'normal',
        },
        {
            path: '../../../public/에이투지체-7Bold.ttf',
            weight: '700',
            style: 'normal',
        },
        {
            path: '../../../public/에이투지체-8ExtraBold.ttf',
            weight: '800',
            style: 'normal',
        },
        {
            path: '../../../public/에이투지체-9Black.ttf',
            weight: '900',
            style: 'normal',
        },
    ],
    // CSS variable exposed for later wiring (e.g. root font-family assignment)
    variable: '--font-a2z',
    display: 'swap',
});

export default A2Z;
