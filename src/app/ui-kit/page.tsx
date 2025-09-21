"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tabs,
} from "@/components/ui";
import { AppLayout } from "@/components/layout/AppLayout";
import { NAV_ITEMS, NavItem } from "@/components/layout/navConfig";

type RoleId = "requester" | "procurement" | "approver" | "admin";

const tabs = [
  { id: "overview", label: "Overview", content: "Token-driven UI kit preview." },
  { id: "components", label: "Components", content: "Explore shared primitives for upcoming work." },
];

const PROJECTS = [
  { id: "1", name: "Project Alpha" },
  { id: "2", name: "Project Beta" },
];

export default function UIKitShowcasePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<RoleId>("admin");
  const [selectedProjectId, setSelectedProjectId] = useState(PROJECTS[0]?.id ?? "");

  const handleNavigate = useCallback(
    (item: NavItem) => {
      router.push(item.href);
    },
    [router]
  );

  return (
    <AppLayout
      navItems={NAV_ITEMS}
      activeNavId="ui-kit"
      onNavigate={handleNavigate}
      projects={PROJECTS}
      selectedProjectId={selectedProjectId}
      onProjectChange={(projectId) => setSelectedProjectId(projectId)}
      userRole={userRole}
      onRoleChange={setUserRole}
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-brand-text">UI Kit Showcase</h1>
        <p className="text-brand-text/70">
          Token-backed components introduced in Story 2.1 with playground examples.
        </p>
      </header>

      <Card header="Buttons" actions={<span className="text-xs text-brand-text/60">Available states</span>}>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button isLoading>Loading</Button>
        </div>
      </Card>

      <Card header="Inputs">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Project Name" placeholder="Enter name" required />
          <Input label="Quantity" type="number" hint="Must be greater than zero" />
        </div>
      </Card>

      <Card header="Tabs & Modals">
        <Tabs tabs={tabs} />
        <div className="pt-4">
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Open Modal Preview
          </Button>
        </div>
      </Card>

      <Card header="Table">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Component</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Notes</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Button</TableCell>
              <TableCell>Ready</TableCell>
              <TableCell>Variants: primary, secondary, ghost, danger.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Input</TableCell>
              <TableCell>Ready</TableCell>
              <TableCell>Supports labels, hints, errors.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modal Title"
        description="Modal description using UI kit styling."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p>Reusable modal built with shared tokens and focus management.</p>
      </Modal>
    </AppLayout>
  );
}
