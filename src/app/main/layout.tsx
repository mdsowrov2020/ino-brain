import LayoutMain from "@/components/sections/layout/LayoutMain";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutMain>{children}</LayoutMain>;
}
