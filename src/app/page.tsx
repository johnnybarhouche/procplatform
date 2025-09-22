"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function Home({ searchParams }: { searchParams: { view?: string } }) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewId>((searchParams?.view as ViewId) || DEFAULT_VIEW);
  const [userRole, setUserRole] = useState<RoleId>("requester");
  const [selectedProjectId, setSelectedProjectId] = useState(PROJECTS[0]?.id ?? "");

  // Removed redirect logic - now handled in component rendering

  const navItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(userRole);
      }),
    [userRole]
  );

  // URL parameters are now handled directly via searchParams prop

  const handleNavigate = useCallback(
    (item: NavItem) => {
      if (item.id === "ui-kit") {
        router.push(item.href);
        return;
      }
      // Update the current view state
      setCurrentView(item.id as ViewId);
      router.push(item.href, { scroll: false });
    },
    [router]
  );

  const renderedView = useMemo(() => {
    switch (currentView) {
      case "mr-form":
        return <MaterialRequestForm projects={PROJECTS} selectedProjectId={selectedProjectId} />;
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
  }, [currentView, userRole, selectedProjectId]);

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

