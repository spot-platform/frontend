import type { AdminPostFaqItem } from '../model/types';

export function AdminPostFaqSection({ items }: { items: AdminPostFaqItem[] }) {
    return (
        <section>
            <div className="border-t border-border-soft px-1 pt-5">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                        FAQ
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        adminPost 안내
                    </h2>
                </div>

                <div className="mt-4 flex flex-col divide-y divide-border-soft">
                    {items.map((item) => (
                        <article
                            key={item.question}
                            className="py-4 first:pt-0 last:pb-0"
                        >
                            <h3 className="text-sm font-semibold text-text-primary">
                                {item.question}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-text-secondary">
                                {item.answer}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
