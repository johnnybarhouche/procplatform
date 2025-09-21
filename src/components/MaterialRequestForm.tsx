"use client";

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { Button, Card, Input, Select, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Badge } from "@/components/ui";
import { PageLayout } from "@/components/layout/PageLayout";
import ItemPicker from "./ItemPicker";
import { Item } from "@/types/procurement";

interface MRLineItem {
  id: string;
  itemCode: string;
  description: string;
  uom: string;
  qty: number;
  remarks: string;
  location: string;
  brandAsset: string;
  serialChassisEngineNo: string;
  modelYear: string;
  attachments: LineAttachment[];
}

interface LineAttachment {
  id: string;
  file: File;
  status: "pending" | "uploaded";
  url?: string;
}

interface FormAttachment extends LineAttachment {}

interface MaterialRequestFormProps {
  projects: Array<{ id: string; name: string }>;
  onSubmit?: (data: any) => void;
}

const UNIT_OF_MEASURE_OPTIONS = ["EA", "BOX", "KG", "L", "SET", "PACK"];

const createEmptyLineItem = (): MRLineItem => ({
  id: crypto.randomUUID(),
  itemCode: "",
  description: "",
  uom: "EA",
  qty: 1,
  remarks: "",
  location: "",
  brandAsset: "",
  serialChassisEngineNo: "",
  modelYear: "",
  attachments: [],
});

export default function MaterialRequestForm({ projects, onSubmit }: MaterialRequestFormProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects.length === 1 ? projects[0].id : ""
  );
  const [lineItems, setLineItems] = useState<MRLineItem[]>([createEmptyLineItem()]);
  const [formAttachments, setFormAttachments] = useState<FormAttachment[]>([]);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [activePickerLineId, setActivePickerLineId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isFormValid = useMemo(() => {
    const hasProject = Boolean(selectedProjectId);
    const lineItemValid = lineItems.every((item) =>
      item.itemCode.trim() &&
      item.description.trim() &&
      item.uom.trim() &&
      Number(item.qty) > 0
    );
    return hasProject && lineItemValid;
  }, [selectedProjectId, lineItems]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!selectedProjectId) {
      errors.project = "Please select a project";
    }
    
    lineItems.forEach((item, index) => {
      if (!item.itemCode.trim()) {
        errors[`itemCode-${item.id}`] = "Item code is required";
      }
      if (!item.description.trim()) {
        errors[`description-${item.id}`] = "Description is required";
      }
      if (!item.uom.trim()) {
        errors[`uom-${item.id}`] = "Unit of measure is required";
      }
      if (Number(item.qty) <= 0) {
        errors[`qty-${item.id}`] = "Quantity must be greater than 0";
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddLineItem = () => {
    setLineItems((prev) => [...prev, createEmptyLineItem()]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const handleLineItemChange = (
    id: string,
    field: keyof Omit<MRLineItem, "attachments" | "qty">,
    value: string
  ) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleQuantityChange = (id: string, value: number) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Number.isNaN(value) ? 0 : Math.max(value, 0) } : item
      )
    );
  };

  const handleItemSelect = (selected: Item) => {
    if (!activePickerLineId) return;
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === activePickerLineId
          ? {
              ...item,
              itemCode: selected.item_code ?? item.itemCode,
              description: selected.description ?? item.description,
              uom: selected.uom ?? item.uom,
              brandAsset: selected.brand ?? item.brandAsset,
              modelYear: selected.model ?? item.modelYear,
            }
          : item
      )
    );
    setShowItemPicker(false);
    setActivePickerLineId(null);
  };

  const handleLineAttachmentChange = (lineId: string, event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === lineId
          ? {
              ...item,
              attachments: [
                ...item.attachments,
                ...files.map((file) => ({ id: crypto.randomUUID(), file, status: "pending" as const })),
              ],
            }
          : item
      )
    );
    event.target.value = "";
  };

  const removeLineAttachment = (lineId: string, attachmentId: string) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === lineId
          ? {
              ...item,
              attachments: item.attachments.filter((attachment) => attachment.id !== attachmentId),
            }
          : item
      )
    );
  };

  const handleFormAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setFormAttachments((prev) => [
      ...prev,
      ...files.map((file) => ({ id: crypto.randomUUID(), file, status: "pending" as const })),
    ]);
    event.target.value = "";
  };

  const removeFormAttachment = (attachmentId: string) => {
    setFormAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId));
  };

  const resetForm = () => {
    setLineItems([createEmptyLineItem()]);
    setFormAttachments([]);
    setSelectedProjectId(projects.length === 1 ? projects[0].id : "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        projectId: selectedProjectId,
        lineItems: lineItems.map((item) => ({
          ...item,
          attachments: item.attachments.map((attachment) => attachment.file.name),
        })),
        attachments: formAttachments.map((attachment) => attachment.file.name),
      };

      // If onSubmit prop is provided, use it for testing
      if (onSubmit) {
        onSubmit(payload);
        resetForm();
        return;
      }

      // Otherwise, proceed with actual API calls
      const uploadAll = async (files: LineAttachment[]) => {
        if (!files.length) return [] as string[];
        const formData = new FormData();
        files.forEach((item) => formData.append("files", item.file));
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadResponse.ok) {
          throw new Error("File upload failed");
        }
        const uploadData = await uploadResponse.json();
        return (uploadData.files ?? []).map((file: { url: string }) => file.url);
      };

      const allLineAttachments = lineItems.flatMap((item) => item.attachments);
      const formAttachmentUrls = await uploadAll(formAttachments);
      const lineAttachmentUrls = await uploadAll(allLineAttachments);

      const apiPayload = {
        ...payload,
        attachments: formAttachmentUrls,
        lineItemAttachmentUrls,
      };

      const response = await fetch("/api/mrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to create Material Request");
      }

      const data = await response.json();
      alert(`Material Request created successfully! MR ID: ${data.mrId ?? "unknown"}`);
      resetForm();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to create Material Request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout 
      title="Create Material Request"
      description="Submit a new material request for your project"
    >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card header="Request Details">
            {projects.length === 1 ? (
              <p className="text-brand-text/80">
                <strong>Project:</strong> {projects[0].name}
              </p>
            ) : (
              <div className="space-y-2">
                <Select
                  label="Project"
                  required
                  value={selectedProjectId}
                  onChange={(event) => {
                    setSelectedProjectId(event.target.value);
                    if (validationErrors.project) {
                      setValidationErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.project;
                        return newErrors;
                      });
                    }
                  }}
                  error={validationErrors.project}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
                {validationErrors.project && (
                  <p className="text-sm text-status-danger">{validationErrors.project}</p>
                )}
              </div>
            )}
          </Card>

          <Card
            header="Line Items"
            actions={
              <Button type="button" onClick={handleAddLineItem} size="sm">
                Add Line Item
              </Button>
            }
          >
            <Table>
              <TableHead>
                <TableRow className="hidden md:table-row">
                  <TableHeaderCell>Item Details</TableHeaderCell>
                  <TableHeaderCell>Quantity & UoM</TableHeaderCell>
                  <TableHeaderCell>Additional Info</TableHeaderCell>
                  <TableHeaderCell>Attachments</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lineItems.map((item, index) => (
                  <TableRow key={item.id} className="align-top">
                        <TableCell>
                          <div className="space-y-3">
                            <Input
                              label={`Line Item ${index + 1}`}
                              required
                              value={item.itemCode}
                              onChange={(event) => {
                                handleLineItemChange(item.id, "itemCode", event.target.value);
                                if (validationErrors[`itemCode-${item.id}`]) {
                                  setValidationErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors[`itemCode-${item.id}`];
                                    return newErrors;
                                  });
                                }
                              }}
                              error={validationErrors[`itemCode-${item.id}`]}
                            />
                            <Input
                              label="Description"
                              required
                              value={item.description}
                              onChange={(event) => {
                                handleLineItemChange(item.id, "description", event.target.value);
                                if (validationErrors[`description-${item.id}`]) {
                                  setValidationErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors[`description-${item.id}`];
                                    return newErrors;
                                  });
                                }
                              }}
                              error={validationErrors[`description-${item.id}`]}
                            />
                          </div>
                        </TableCell>
                    <TableCell>
                      <div className="space-y-3">
                        <Input
                          label="Quantity"
                          type="number"
                          required
                          min={1}
                          value={item.qty}
                          onChange={(event) => {
                            handleQuantityChange(item.id, Number(event.target.value));
                            if (validationErrors[`qty-${item.id}`]) {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[`qty-${item.id}`];
                                return newErrors;
                              });
                            }
                          }}
                          error={validationErrors[`qty-${item.id}`]}
                        />
                        <Select
                          label="Unit of Measure"
                          required
                          value={item.uom}
                          onChange={(event) => {
                            handleLineItemChange(item.id, "uom", event.target.value);
                            if (validationErrors[`uom-${item.id}`]) {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[`uom-${item.id}`];
                                return newErrors;
                              });
                            }
                          }}
                          error={validationErrors[`uom-${item.id}`]}
                        >
                          {UNIT_OF_MEASURE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="grid grid-cols-1 gap-3">
                        <Input
                          label="Location"
                          value={item.location}
                          onChange={(event) => handleLineItemChange(item.id, "location", event.target.value)}
                        />
                        <Input
                          label="Brand / Asset"
                          value={item.brandAsset}
                          onChange={(event) => handleLineItemChange(item.id, "brandAsset", event.target.value)}
                        />
                        <Input
                          label="Serial / Chassis / Engine Number"
                          value={item.serialChassisEngineNo}
                          onChange={(event) => handleLineItemChange(item.id, "serialChassisEngineNo", event.target.value)}
                        />
                        <Input
                          label="Model Year"
                          value={item.modelYear}
                          onChange={(event) => handleLineItemChange(item.id, "modelYear", event.target.value)}
                        />
                        <Input
                          label="Remarks"
                          value={item.remarks}
                          onChange={(event) => handleLineItemChange(item.id, "remarks", event.target.value)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <input
                          id={`line-attachment-${item.id}`}
                          type="file"
                          className="hidden"
                          onChange={(event) => handleLineAttachmentChange(item.id, event)}
                          accept="image/*,.pdf,.doc,.docx"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => document.getElementById(`line-attachment-${item.id}`)?.click()}
                        >
                          Add File
                        </Button>
                        <div className="space-y-2">
                          {item.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center justify-between rounded-lg border border-brand-text/10 bg-brand-surface/50 px-3 py-2 text-sm transition hover:bg-brand-surface"
                            >
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant={attachment.status === "uploaded" ? "success" : "primary"}
                                  className="text-xs"
                                >
                                  {attachment.status === "uploaded" ? "Uploaded" : "Pending"}
                                </Badge>
                                <span className="text-brand-text/90 font-medium truncate max-w-[120px]">
                                  {attachment.file.name}
                                </span>
                                <span className="text-xs text-brand-text/60">
                                  {(attachment.file.size / 1024).toFixed(1)} KB
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-status-danger hover:text-status-danger hover:bg-status-danger/10 transition-colors"
                                onClick={() => removeLineAttachment(item.id, attachment.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          {!item.attachments.length && (
                            <div className="text-center py-3">
                              <p className="text-xs text-brand-text/60">No attachments added.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActivePickerLineId(item.id);
                            setShowItemPicker(true);
                          }}
                        >
                          Browse Catalog
                        </Button>
                        {lineItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-status-danger hover:text-status-danger"
                            onClick={() => handleRemoveLineItem(item.id)}
                          >
                            Remove Line
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card header="Attachments">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-brand-text/80 font-medium">
                  Request-Level Attachments
                </p>
                <p className="text-xs text-brand-text/60">
                  Upload supporting documents that apply to the entire material request.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <input
                  id="form-attachments-input"
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFormAttachmentChange}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => document.getElementById('form-attachments-input')?.click()}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Files
                </Button>
              </div>
              
              <div className="space-y-3">
                {formAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between rounded-lg border border-brand-text/10 bg-brand-surface/50 px-4 py-3 text-sm transition hover:bg-brand-surface"
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={attachment.status === "uploaded" ? "success" : "primary"}
                        className="text-xs"
                      >
                        {attachment.status === "uploaded" ? "Uploaded" : "Pending"}
                      </Badge>
                      <div className="flex flex-col">
                        <span className="text-brand-text/90 font-medium">
                          {attachment.file.name}
                        </span>
                        <span className="text-xs text-brand-text/60">
                          {(attachment.file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-status-danger hover:text-status-danger hover:bg-status-danger/10 transition-colors"
                      onClick={() => removeFormAttachment(attachment.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {!formAttachments.length && (
                  <div className="text-center py-6 border-2 border-dashed border-brand-text/20 rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-brand-text/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-brand-text/60">No request-level attachments yet.</p>
                      <p className="text-xs text-brand-text/50">Click "Add Files" to upload supporting documents.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={!isFormValid || isSubmitting} isLoading={isSubmitting}>
              Submit Material Request
            </Button>
          </div>
        </form>

      {showItemPicker && (
        <ItemPicker
          onItemSelect={handleItemSelect}
          onClose={() => {
            setShowItemPicker(false);
            setActivePickerLineId(null);
          }}
        />
      )}
    </PageLayout>
  );
}
