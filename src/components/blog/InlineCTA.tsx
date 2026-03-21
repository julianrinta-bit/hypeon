interface InlineCTAProps {
  headline?: string;
  body?: string;
  ctaLabel?: string;
}

export default function InlineCTA({
  headline = 'Ready to grow your channel?',
  body = 'Get a free audit of your YouTube strategy.',
  ctaLabel = 'Book Your Free Audit',
}: InlineCTAProps) {
  return (
    <aside className="blog-cta" role="complementary">
      <p className="blog-cta__headline">{headline}</p>
      <p className="blog-cta__body">{body}</p>
      <a href="/#contact" className="blog-cta__button">{ctaLabel}</a>
    </aside>
  );
}
