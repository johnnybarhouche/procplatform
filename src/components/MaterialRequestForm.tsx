'use client';

import { useState } from 'react';
import ItemPicker from './ItemPicker';
import { Item } from '@/types/procurement';
import { Button, Card, Input } from '@/components/ui';

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
}

interface MaterialRequestFormProps {
  projects: Array<{ id: string; name: string }>;
}

export default function MaterialRequestForm({ projects }: MaterialRequestFormProps) {
  const [selectedProject, setSelectedProject] = useState<string>(
    projects.length === 1 ? projects[0].id : ''
  );
  const [lineItems, setLineItems] = useState<MRLineItem[]>([
    {
      id: '1',
      itemCode: '',
      description: '',
      uom: '',
      qty: 1,
      remarks: '',
      location: '',
      brandAsset: '',
      serialChassisEngineNo: '',
      modelYear: '',
    }
  ]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [pickingForItemId, setPickingForItemId] = useState<string | null>(null);

  const addLineItem = () => {
    const newItem: MRLineItem = {
      id: Date.now().toString(),
      itemCode: '',
      description: '',
      uom: '',
      qty: 1,
      remarks: '',
      location: '',
      brandAsset: '',
      serialChassisEngineNo: '',
      modelYear: '',
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const openItemPicker = (itemId: string) => {
    setPickingForItemId(itemId);
    setShowItemPicker(true);
  };

  const handleItemSelect = (item: Item) => {
    if (pickingForItemId) {
      updateLineItem(pickingForItemId, 'itemCode', item.item_code);
      updateLineItem(pickingForItemId, 'description', item.description);
      updateLineItem(pickingForItemId, 'uom', item.uom);
      if (item.brand) updateLineItem(pickingForItemId, 'brandAsset', item.brand);
      if (item.model) updateLineItem(pickingForItemId, 'modelYear', item.model);
    }
    setShowItemPicker(false);
    setPickingForItemId(null);
  };

  const updateLineItem = (id: string, field: keyof MRLineItem, value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const hasValidLineItems = lineItems.every(item => 
      item.itemCode && item.description && item.uom && item.qty > 0
    );
    
    if (!selectedProject || !hasValidLineItems) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Upload files first if any
      let uploadedFileUrls: string[] = [];
      if (attachments.length > 0) {
        const formData = new FormData();
        attachments.forEach(file => {
          formData.append('files', file);
        });

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('File upload failed');
        }

        const uploadData = await uploadResponse.json();
        uploadedFileUrls = uploadData.files.map((file: { url: string }) => file.url);
      }

      // Create Material Request
      const mrResponse = await fetch('/api/mrs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: selectedProject,
          lineItems,
          attachments: uploadedFileUrls
        })
      });

      if (!mrResponse.ok) {
        let errorMessage = 'Failed to create Material Request';
        try {
          const rawBody = (await mrResponse.text()).trim();
          if (rawBody) {
            try {
              const parsed = JSON.parse(rawBody);
              errorMessage = parsed.error || parsed.message || rawBody;
            } catch {
              errorMessage = rawBody;
            }
          }
        } catch (parseError) {
          console.error('Error reading MR response body:', parseError);
        }
        throw new Error(errorMessage);
      }

      const mrData = await mrResponse.json();
      alert(`Material Request created successfully! MR ID: ${mrData.mrId}`);
      
      // Reset form
      setLineItems([{
        id: '1',
        itemCode: '',
        description: '',
        uom: '',
        qty: 1,
        remarks: '',
        location: '',
        brandAsset: '',
        serialChassisEngineNo: '',
        modelYear: '',
      }]);
      setAttachments([]);

    } catch (error) {
      console.error('Error creating MR:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Card header="Create Material Request">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          <Card header="Project Selection">
            {projects.length === 1 ? (
              <div className="text-brand-text/80">
                <strong>Project:</strong> {projects[0].name}
              </div>
            ) : (
              <label className="flex w-full flex-col space-y-2 text-sm text-brand-text/80">
                <span className="font-medium text-brand-text">Project *</span>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full rounded-md border border-brand-text/20 bg-brand-surface px-3 py-2 text-brand-text focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </Card>

          {/* Line Items */}
          <Card
            header="Line Items"
            actions={
              <Button type="button" onClick={addLineItem} size="sm">
                Add Line Item
              </Button>
            }
          >
            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <Card
                  key={item.id}
                  header={`Line Item ${index + 1}`}
                  actions={
                    lineItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-status-danger hover:text-status-danger"
                        onClick={() => removeLineItem(item.id)}
                      >
                        Remove
                      </Button>
                    )
                  }
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <div className="flex gap-2">
                        <Input
                      label="Item Code"
                      required
                      value={item.itemCode}
                      onChange={(e) => updateLineItem(item.id, 'itemCode', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => openItemPicker(item.id)}
                    >
                      Select
                    </Button>
                  </div>
                </div>

                <div>
                  <Input
                    label="Description"
                    required
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="UoM"
                    required
                    value={item.uom}
                    onChange={(e) => updateLineItem(item.id, 'uom', e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Quantity"
                    type="number"
                    min={1}
                    required
                    value={item.qty}
                    onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <Input
                    label="Remarks"
                    value={item.remarks}
                    onChange={(e) => updateLineItem(item.id, 'remarks', e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Location"
                    value={item.location}
                    onChange={(e) => updateLineItem(item.id, 'location', e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Brand/Asset"
                    value={item.brandAsset}
                    onChange={(e) => updateLineItem(item.id, 'brandAsset', e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Serial/Chassis/Engine No."
                    value={item.serialChassisEngineNo}
                    onChange={(e) => updateLineItem(item.id, 'serialChassisEngineNo', e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Model Year"
                    value={item.modelYear}
                    onChange={(e) => updateLineItem(item.id, 'modelYear', e.target.value)}
                  />
                </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* File Attachments */}
          <Card header="Attachments">
            <div className="space-y-3">
              <label className="flex w-full flex-col space-y-2 text-sm text-brand-text/80">
                <span className="font-medium text-brand-text">Upload Files</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="w-full rounded-md border border-brand-text/20 bg-brand-surface px-3 py-2 text-brand-text focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </label>
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-brand-text">Selected Files</h3>
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md border border-brand-text/10 bg-brand-surface px-3 py-2 text-sm text-brand-text/80">
                      <span>{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-status-danger hover:text-status-danger"
                        onClick={() => removeAttachment(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Submit Material Request
            </Button>
          </div>
        </form>
      </Card>

      {/* Item Picker Modal */}
      {showItemPicker && (
        <ItemPicker
          onItemSelect={handleItemSelect}
          onClose={() => {
            setShowItemPicker(false);
            setPickingForItemId(null);
          }}
        />
      )}
    </div>
  );
}
