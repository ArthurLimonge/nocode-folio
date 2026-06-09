import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const { loading, user } = useAuth();
  const router = useRouter();
  const redirecionou = useRef(false);

  useEffect(() => {
    if (loading || redirecionou.current) return;

    if (!user) {
      redirecionou.current = true;
      router.navigate({ to: "/login" });
      return;
    }

    redirecionou.current = true;
    supabase
      .from("perfis")
      .select("slug")
      .eq("usuario_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.slug) {
          router.navigate({ to: "/$slug", params: { slug: data.slug } });
        } else {
          router.navigate({ to: "/" });
        }
      });
  }, [loading, user, router]);

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Entrando…</p>
      </div>
    </main>
  );
}
