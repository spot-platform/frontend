import type { Preview } from '@storybook/nextjs-vite';
import '@frontend/design-system/storybook.css';

const preview: Preview = {
    parameters: {
        layout: 'centered',
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        a11y: {
            test: 'todo',
        },
        backgrounds: {
            default: 'canvas',
            values: [
                { name: 'canvas', value: '#f9fafb' },
                { name: 'white', value: '#ffffff' },
                { name: 'ink', value: '#042f2e' },
            ],
        },
    },
};

export default preview;
