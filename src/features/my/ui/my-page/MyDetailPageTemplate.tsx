import { DetailHeader, DetailPageShell } from '@/shared/ui';

type DetailItem = {
    label: string;
    description: string;
};

type DetailSection = {
    title: string;
    items: DetailItem[];
};

type MyDetailPageTemplateProps = {
    title: string;
    description: string;
    sections: DetailSection[];
};

export function MyDetailPageTemplate({
    title,
    description,
    sections,
}: MyDetailPageTemplateProps) {
    return (
        <>
            <DetailHeader title={title} />
            <DetailPageShell
                as="main"
                px="md"
                gap="md"
                topInset="md"
                bottomInset="lg"
                className="bg-surface"
            >
                <section className="border-b border-gray-200 pb-4">
                    <h1 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                        {description}
                    </p>
                </section>

                {sections.map((section) => (
                    <section
                        key={section.title}
                        className="rounded-2xl border border-gray-200 bg-white"
                    >
                        <h2 className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900">
                            {section.title}
                        </h2>
                        <ul>
                            {section.items.map((item, index) => (
                                <li
                                    key={item.label}
                                    className={[
                                        'px-4 py-3',
                                        index > 0
                                            ? 'border-t border-gray-200'
                                            : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                >
                                    <p className="text-sm font-medium text-gray-900">
                                        {item.label}
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-gray-600">
                                        {item.description}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </DetailPageShell>
        </>
    );
}
