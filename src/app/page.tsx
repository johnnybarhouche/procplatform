"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MaterialRequestForm from "@/components/MaterialRequestForm";
import ProcurementDashboard from "@/components/ProcurementDashboard";
import QuoteApprovalDashboard from "@/components/QuoteApprovalDashboard";
import PRDashboard from "@/components/PRDashboard";
import PODashboard from "@/components/PODashboard";
import SupplierDashboard from "@/components/SupplierDashboard";
import ItemMasterDashboard from "@/components/ItemMasterDashboard";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import { AppLayout } from "@/components/layout/AppLayout";
import { NAV_ITEMS, NavItem } from "@/components/layout/navConfig";

const PROJECTS = [
  { id: "1", name: "Project Alpha" },
  { id: "2", name: "Project Beta" },
];

type ViewId =
  | "mr-form"
  | "procurement-dashboard"
  | "quote-approval"
  | "pr-dashboard"
  | "po-dashboard"
  | "supplier-dashboard"
  | "item-database"
  | "analytics"
  | "admin";

type RoleId = "requester" | "procurement" | "approver" | "admin";

const DEFAULT_VIEW: ViewId = "mr-form";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialView = useMemo(() => {
    const view = searchParams.get("view") as ViewId | null;
    return view ?? DEFAULT_VIEW;
  }, [searchParams]);

  const [currentView, setCurrentView] = useState<ViewId>(initialView);
  const [userRole, setUserRole] = useState<RoleId>("requester");
  const [selectedProjectId, setSelectedProjectId] = useState(PROJECTS[0]?.id ?? "");

  useEffect(() => {
    if (userRole !== "admin" && currentView === "admin") {
      setCurrentView("mr-form");
      router.push("/?view=mr-form", { scroll: false });
    }
  }, [userRole, currentView, router]);

  const navItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(userRole);
      }),
    [userRole]
  );

  useEffect(() => {
    const view = searchParams.get("view") as ViewId | null;
    if (view && view !== currentView) {
      setCurrentView(view);
    }
  }, [searchParams, currentView]);

  const handleNavigate = useCallback(
    (item: NavItem) => {
      if (item.id === "ui-kit") {
        router.push(item.href);
        return;
      }
      const nextView = item.id as ViewId;
      setCurrentView(nextView);
      router.push(item.href, { scroll: false });
    },
    [router]
  );

  const renderedView = useMemo(() => {
    switch (currentView) {
      case "mr-form":
        return <MaterialRequestForm projects={PROJECTS} />;
      case "procurement-dashboard":
        return (
          <ProcurementDashboard
            userRole={userRole === "procurement" ? "procurement" : "admin"}
          />
        );
      case "quote-approval":
        return (
          <QuoteApprovalDashboard
            userRole={userRole === "approver" ? "approver" : "requester"}
          />
        );
      case "pr-dashboard":
        return <PRDashboard userRole={userRole} />;
      case "po-dashboard":
        return <PODashboard userRole={userRole} />;
      case "supplier-dashboard":
        return <SupplierDashboard userRole={userRole} />;
      case "item-database":
        return <ItemMasterDashboard userRole={userRole} />;
      case "analytics":
        return <AnalyticsDashboard userRole={userRole} />;
      case "admin":
        return <AdminDashboard userRole={userRole} />;
      default:
        return null;
    }
  }, [currentView, userRole]);

  return (
    <AppLayout
      navItems={navItems}
      activeNavId={currentView}
      onNavigate={handleNavigate}
      projects={PROJECTS}
      selectedProjectId={selectedProjectId}
      onProjectChange={(projectId) => setSelectedProjectId(projectId)}
      userRole={userRole}
      onRoleChange={setUserRole}
    >
      {renderedView}
    </AppLayout>
  );
}
