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
  OtpInput,
  AvatarMenu,
  StatusChip,
  Stepper,
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
  const [user, setUser] = useState({
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    phone: "+971 50 123 4567",
    address: "Dubai, UAE",
    designation: "Procurement Manager",
    role: userRole as string,
    project: PROJECTS.find(p => p.id === selectedProjectId)?.name || "Project Alpha"
  });

  const handleUserUpdate = useCallback((updatedUser: typeof user) => {
    setUser(updatedUser);
  }, []);

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
      userRole={userRole}
      user={user}
      onUserUpdate={handleUserUpdate}
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

      <Card header="OTP Input">
        <div className="space-y-4">
          <OtpInput
            length={6}
            onComplete={(otp) => console.log('OTP completed:', otp)}
            onResend={() => console.log('Resend OTP')}
            resendIn={30}
          />
        </div>
      </Card>

      <Card header="Status Chips">
        <div className="flex flex-wrap gap-3">
          <StatusChip status="new-request" />
          <StatusChip status="rfq-sent" />
          <StatusChip status="quotes-received" />
          <StatusChip status="under-review" />
          <StatusChip status="approved" />
          <StatusChip status="rejected" />
          <StatusChip status="pending" />
          <StatusChip status="completed" />
        </div>
      </Card>

      <Card header="Stepper">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-brand-text/70 mb-3">Horizontal Stepper</h4>
            <Stepper
              steps={[
                { id: 'step1', title: 'Select Items', description: 'Choose materials' },
                { id: 'step2', title: 'Add Suppliers', description: 'Invite vendors' },
                { id: 'step3', title: 'Review & Send', description: 'Final review' },
              ]}
              currentStep="step2"
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-brand-text/70 mb-3">Vertical Stepper</h4>
            <Stepper
              steps={[
                { id: 'step1', title: 'Project Setup', description: 'Configure project settings' },
                { id: 'step2', title: 'User Assignment', description: 'Assign team members' },
                { id: 'step3', title: 'Review & Launch', description: 'Final review and launch' },
              ]}
              currentStep="step1"
              orientation="vertical"
            />
          </div>
        </div>
      </Card>

      <Card header="Avatar Menu">
        <div className="flex justify-center">
          <AvatarMenu
            user={user}
            onProfile={() => console.log('Profile clicked')}
            onNotifications={() => console.log('Notifications clicked')}
            onSignOut={() => console.log('Sign out clicked')}
          />
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
            <TableRow>
              <TableCell>OtpInput</TableCell>
              <TableCell>Ready</TableCell>
              <TableCell>OTP entry with auto-advance, paste support, countdown.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>StatusChip</TableCell>
              <TableCell>Ready</TableCell>
              <TableCell>Status indicators for inbox tables (MR, RFQ).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Stepper</TableCell>
              <TableCell>Ready</TableCell>
              <TableCell>Multi-step wizard navigation (horizontal/vertical).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>AvatarMenu</TableCell>
              <TableCell>Ready</TableCell>
              <TableCell>Profile menu with user actions and header layout.</TableCell>
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
