import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => { navigate({ to: "/features", replace: true }); }, [navigate]);
    return null;
  },
});
