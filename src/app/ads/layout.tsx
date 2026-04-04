import './ads-layout.css';

export default async function AdsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ads-layout-shell">
      {children}
    </div>
  );
}
