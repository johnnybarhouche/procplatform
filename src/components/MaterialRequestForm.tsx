'use client';

import { useState } from 'react';
import ItemPicker from './ItemPicker';
import { Item } from '@/types/procurement';

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
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Material Request</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Selection */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Selection</h2>
          {projects.length === 1 ? (
            <div className="text-gray-700">
              <strong>Project:</strong> {projects[0].name}
            </div>
          ) : (
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Line Items */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Line Items</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Line Item
            </button>
          </div>

          {lineItems.map((item, index) => (
            <div key={item.id} className="bg-white p-4 rounded-lg mb-4 border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Line Item {index + 1}</h3>
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Code *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={item.itemCode}
                      onChange={(e) => updateLineItem(item.id, 'itemCode', e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => openItemPicker(item.id)}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                    >
                      Select from Catalog
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UoM *
                  </label>
                  <input
                    type="text"
                    value={item.uom}
                    onChange={(e) => updateLineItem(item.id, 'uom', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <input
                    type="text"
                    value={item.remarks}
                    onChange={(e) => updateLineItem(item.id, 'remarks', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={item.location}
                    onChange={(e) => updateLineItem(item.id, 'location', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand/Asset
                  </label>
                  <input
                    type="text"
                    value={item.brandAsset}
                    onChange={(e) => updateLineItem(item.id, 'brandAsset', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial/Chassis/Engine No.
                  </label>
                  <input
                    type="text"
                    value={item.serialChassisEngineNo}
                    onChange={(e) => updateLineItem(item.id, 'serialChassisEngineNo', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Year
                  </label>
                  <input
                    type="text"
                    value={item.modelYear}
                    onChange={(e) => updateLineItem(item.id, 'modelYear', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* File Attachments */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h2>
          <div className="space-y-4">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {attachments.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Selected Files:</h3>
                {attachments.map((file, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium"
          >
            Submit Material Request
          </button>
        </div>
      </form>

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
