import Link from 'next/link';

interface ReadAlsoProps {
  title: string;
  href: string;
}

export default function ReadAlso({ title, href }: ReadAlsoProps) {
  return (
    <aside className="read-also">
      <span className="read-also__label">Read also</span>
      <Link href={href} className="read-also__link">{title} →</Link>
    </aside>
  );
}
