'use client';

import { useState, useEffect } from 'react';
import { Item } from '@/types/procurement';

interface ItemPickerProps {
  onItemSelect: (item: Item) => void;
  onClose: () => void;
}

export default function ItemPicker({ onItemSelect, onClose }: ItemPickerProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(items.map(item => item.category))];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-brand-surface rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
          <div className="flex justify-center items-center h-64">
            <div className="text-brand-text/60">Loading items...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-brand-surface rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Item from Catalog</h2>
          <button
            onClick={onClose}
            className="text-brand-text/60 hover:text-brand-text/80"
          >
            ✕
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Search Items
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by item code or description..."
              className="w-full p-2 border border-brand-text/20 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-brand-text/20 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Items List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center text-brand-text/60 py-8">
              No items found matching your criteria.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="border border-brand-text/10 rounded-lg p-4 hover:bg-brand-surface cursor-pointer"
                  onClick={() => onItemSelect(item)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-brand-text">{item.item_code}</span>
                        <span className="text-sm text-brand-text/60">•</span>
                        <span className="text-sm text-brand-text/60">{item.category}</span>
                      </div>
                      <p className="text-brand-text/80 mt-1">{item.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-brand-text/60">
                        <span>UoM: {item.uom}</span>
                        {item.brand && <span>Brand: {item.brand}</span>}
                        {item.model && <span>Model: {item.model}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => onItemSelect(item)}
                      className="ml-4 px-3 py-1 bg-brand-primary text-white text-sm rounded-md hover:bg-brand-primary/90"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

