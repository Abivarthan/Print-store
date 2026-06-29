import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSession } from "@/lib/auth";
import { getMyRoles } from "@/lib/admin.functions";

export function useRoles() {
  const { session, loading: sessionLoading } = useSession();
  const fetchRoles = useServerFn(getMyRoles);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      setRoles([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchRoles()
      .then((r) => alive && setRoles(r ?? []))
      .catch(() => alive && setRoles([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // fetchRoles is stable from useServerFn; depending on session id is enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id, sessionLoading]);

  return {
    roles,
    loading: sessionLoading || loading,
    isStaff: roles.includes("admin") || roles.includes("staff"),
    isAdmin: roles.includes("admin"),
  };
}
