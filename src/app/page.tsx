"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
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
const VIEW_IDS: readonly ViewId[] = [
  "mr-form",
  "procurement-dashboard",
  "quote-approval",
  "pr-dashboard",
  "po-dashboard",
  "supplier-dashboard",
  "item-database",
  "analytics",
  "admin",
];

const isValidViewId = (value: string | null): value is ViewId =>
  typeof value === "string" && VIEW_IDS.includes(value as ViewId);

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, loading: authLoading } = useAuth();
  const { selectedProject, loading: projectLoading } = useProject();
  const [currentView, setCurrentView] = useState<ViewId>(() => {
    const initialView = searchParams.get("view");
    return isValidViewId(initialView) ? initialView : DEFAULT_VIEW;
  });
  const [userRole, setUserRole] = useState<RoleId>(() => {
    return (user?.role as RoleId) || "requester";
  });

  // Update userRole when user changes
  useEffect(() => {
    if (user?.role) {
      setUserRole(user.role as RoleId);
    }
  }, [user?.role]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
  }, [user, router]);

  // Redirect to auth if no project selected
  useEffect(() => {
    if (user && !selectedProject) {
      router.push('/auth');
      return;
    }
  }, [user, selectedProject, router]);

  const viewParam = searchParams.get("view");

  const navItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        // Filter based on user role
        if (!item.roles) return true;
        return item.roles.includes(userRole);
      }),
    [userRole]
  );

  // Keep current view synchronized with the URL search params
  useEffect(() => {
    const nextView = isValidViewId(viewParam) ? viewParam : DEFAULT_VIEW;
    if (nextView !== currentView) {
      setCurrentView(nextView);
    }
  }, [viewParam, currentView]);

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

  const handleUserUpdate = useCallback((updatedUser: { id: string; name: string; email: string; phone: string; address: string; designation: string; role: string; project: string }) => {
    // Handle user updates if needed
  }, []);

  const renderedView = useMemo(() => {
    if (!selectedProject) {
      return null;
    }
    
    switch (currentView) {
      case "mr-form":
        return <MaterialRequestForm projects={[selectedProject]} selectedProjectId={selectedProject.id} />;
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
  }, [currentView, userRole, selectedProject]);

  // Show loading while authentication or project loading
  if (authLoading || projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-brand-text/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !selectedProject) {
    return null; // Will redirect to auth
  }

  return (
    <AppLayout
      navItems={navItems}
      activeNavId={currentView}
      onNavigate={handleNavigate}
      projects={[selectedProject]}
      selectedProjectId={selectedProject.id}
      userRole={userRole}
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        phone: "+971 50 123 4567",
        address: "Dubai, UAE",
        designation: "Procurement Manager",
        role: user.role,
        project: selectedProject.name
      }}
      onUserUpdate={handleUserUpdate}
    >
      {/* Project Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-brand-primary/5 p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-brand-text">Project:</label>
          <span className="text-sm text-brand-text/70">{selectedProject.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-brand-text">Role:</label>
          <span className="text-sm text-brand-text/70 capitalize">{userRole}</span>
        </div>
      </div>
      {renderedView}
    </AppLayout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}