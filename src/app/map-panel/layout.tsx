

export default function MapPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-[100vh] w-full">{children}</div>;
}