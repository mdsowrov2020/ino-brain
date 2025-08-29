import LayoutMain from "@/components/sections/layout/LayoutMain";
import AuthGuard from "@/features/auth/components/AuthGuard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <LayoutMain>{children}</LayoutMain>
    </AuthGuard>
  );
}
