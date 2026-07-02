import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { 
  Plus, Edit3, Trash2, Check, X, Search, Sliders, Tag, FolderOpen, 
  Layers, Layers3, Archive, RefreshCw, AlertTriangle, CheckCircle, Info 
} from 'lucide-react';

export default function ClassificationManager() {
  const [activeSubTab, setActiveSubTab] = useState<'suppliers' | 'brands' | 'departments' | 'categories' | 'subcategories'>('suppliers');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
  // Lists
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  // Selected Category filter for Subcategories sub-tab
  const [subcatCategoryFilter, setSubcatCategoryFilter] = useState<string>('All');

  // Input states for Add form
  const [newItemName, setNewItemName] = useState('');
  const [newSubcatCategoryId, setNewSubcatCategoryId] = useState<string>('');

  // Editing Row states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingParentId, setEditingParentId] = useState<string>('');

  // Notifications
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 4000);
    } else {
      setMessage(msg);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  useEffect(() => {
    loadAllClassifications();
  }, []);

  const loadAllClassifications = async () => {
    setLoading(true);
    try {
      const [sups, brs, depts, cats, subs] = await Promise.all([
        apiClient.getSuppliers(),
        apiClient.getBrands(),
        apiClient.getDepartments(),
        apiClient.getCategories(),
        apiClient.getSubcategories()
      ]);

      setSuppliers(sups || []);
      setBrands(brs || []);
      setDepartments(depts || []);
      setCategories(cats || []);
      setSubcategories(subs || []);
    } catch (err: any) {
      showNotification(err.message || 'Failed to load classifications', true);
    } finally {
      setLoading(false);
    }
  };

  // 1. Create Operation
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setLoading(true);
    try {
      if (activeSubTab === 'suppliers') {
        await apiClient.createSupplier(newItemName.trim());
        showNotification(`Supplier "${newItemName}" added successfully`);
      } else if (activeSubTab === 'brands') {
        await apiClient.createBrand(newItemName.trim());
        showNotification(`Brand "${newItemName}" added successfully`);
      } else if (activeSubTab === 'departments') {
        await apiClient.createDepartment(newItemName.trim());
        showNotification(`Department "${newItemName}" added successfully`);
      } else if (activeSubTab === 'categories') {
        await apiClient.createCategory(newItemName.trim());
        showNotification(`Category "${newItemName}" added successfully`);
      } else if (activeSubTab === 'subcategories') {
        const catIdNum = parseInt(newSubcatCategoryId);
        if (isNaN(catIdNum)) {
          showNotification('Please select a parent Category first', true);
          setLoading(false);
          return;
        }
        await apiClient.createSubcategory(newItemName.trim(), catIdNum);
        showNotification(`Subcategory "${newItemName}" added successfully`);
      }

      setNewItemName('');
      // Refresh current records
      await loadAllClassifications();
    } catch (err: any) {
      showNotification(err.message || 'Failed to create item', true);
    } finally {
      setLoading(false);
    }
  };

  // 2. Update Operation
  const handleUpdateItem = async (id: number) => {
    if (!editingName.trim()) return;
    setLoading(true);

    try {
      if (activeSubTab === 'suppliers') {
        await apiClient.updateSupplier(id, { name: editingName.trim() });
      } else if (activeSubTab === 'brands') {
        await apiClient.updateBrand(id, { name: editingName.trim() });
      } else if (activeSubTab === 'departments') {
        await apiClient.updateDepartment(id, { name: editingName.trim() });
      } else if (activeSubTab === 'categories') {
        await apiClient.updateCategory(id, { name: editingName.trim() });
      } else if (activeSubTab === 'subcategories') {
        const catIdNum = parseInt(editingParentId);
        if (isNaN(catIdNum)) {
          showNotification('Please select a parent Category', true);
          setLoading(false);
          return;
        }
        await apiClient.updateSubcategory(id, { name: editingName.trim(), categoryId: catIdNum });
      }

      showNotification('Classification updated successfully');
      setEditingId(null);
      setEditingName('');
      setEditingParentId('');
      await loadAllClassifications();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update item', true);
    } finally {
      setLoading(false);
    }
  };

  // 3. Toggle Archive/Restore
  const handleArchiveToggle = async (item: any) => {
    const nextArchiveState = !item.isArchived;
    const actionLabel = nextArchiveState ? 'Archived' : 'Restored';
    setLoading(true);

    try {
      if (activeSubTab === 'suppliers') {
        await apiClient.updateSupplier(item.id, { isArchived: nextArchiveState });
      } else if (activeSubTab === 'brands') {
        await apiClient.updateBrand(item.id, { isArchived: nextArchiveState });
      } else if (activeSubTab === 'departments') {
        await apiClient.updateDepartment(item.id, { isArchived: nextArchiveState });
      } else if (activeSubTab === 'categories') {
        await apiClient.updateCategory(item.id, { isArchived: nextArchiveState });
      } else if (activeSubTab === 'subcategories') {
        await apiClient.updateSubcategory(item.id, { isArchived: nextArchiveState });
      }

      showNotification(`"${item.name}" has been successfully ${actionLabel}`);
      await loadAllClassifications();
    } catch (err: any) {
      showNotification(err.message || 'Failed to toggle archive state', true);
    } finally {
      setLoading(false);
    }
  };

  // Filter current active set based on tab, search query, and archive visibility
  const getFilteredItems = () => {
    let rawList: any[] = [];
    if (activeSubTab === 'suppliers') rawList = suppliers;
    else if (activeSubTab === 'brands') rawList = brands;
    else if (activeSubTab === 'departments') rawList = departments;
    else if (activeSubTab === 'categories') rawList = categories;
    else if (activeSubTab === 'subcategories') {
      rawList = subcategories;
      if (subcatCategoryFilter !== 'All') {
        rawList = rawList.filter(s => s.categoryId === parseInt(subcatCategoryFilter));
      }
    }

    // Apply Archive Filter
    rawList = rawList.filter(item => showArchived ? true : !item.isArchived);

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rawList = rawList.filter(item => item.name.toLowerCase().includes(q));
    }

    return rawList;
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-6">
      
      {/* Dynamic Alerts */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-250 p-4 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2.5 shadow-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2.5 shadow-sm">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Sub-Tabs Selector Header */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3 flex flex-wrap gap-2 shadow-sm">
        <button
          onClick={() => { setActiveSubTab('suppliers'); setSearchQuery(''); setEditingId(null); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'suppliers' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Suppliers ({suppliers.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('brands'); setSearchQuery(''); setEditingId(null); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'brands' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Brands ({brands.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('departments'); setSearchQuery(''); setEditingId(null); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'departments' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'
          }`}
        >
          <Layers3 className="h-4 w-4" />
          <span>Departments ({departments.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('categories'); setSearchQuery(''); setEditingId(null); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'categories' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('subcategories'); setSearchQuery(''); setEditingId(null); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'subcategories' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Subcategories ({subcategories.length})</span>
        </button>

        <button
          onClick={loadAllClassifications}
          className="p-2 ml-auto text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg"
          title="Reload Classifications"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Panel Division */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick-Add Creation Panel */}
        <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm h-fit space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-xs font-black uppercase text-neutral-900 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-amber-500" />
              <span>Add New {activeSubTab.slice(0, -1)}</span>
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1 leading-normal">
              Register a new entry to dynamically feed setup dropdown selectors and product filters.
            </p>
          </div>

          <form onSubmit={handleAddItem} className="space-y-4 text-xs">
            {/* If adding a subcategory, select its parent main category first */}
            {activeSubTab === 'subcategories' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-neutral-500 uppercase">Parent Main Category *</label>
                <select
                  className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg text-xs font-semibold focus:outline-none focus:border-black"
                  required
                  value={newSubcatCategoryId}
                  onChange={(e) => setNewSubcatCategoryId(e.target.value)}
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-neutral-500 uppercase">Name / Label *</label>
              <input
                type="text"
                required
                className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg text-xs focus:outline-none focus:border-black font-semibold"
                placeholder={`e.g. New ${activeSubTab.slice(0, -1)}`}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !newItemName.trim() || (activeSubTab === 'subcategories' && !newSubcatCategoryId)}
              className="w-full bg-neutral-950 text-white font-extrabold text-[10px] uppercase tracking-wider py-2.5 rounded-lg hover:bg-amber-500 hover:text-black transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create {activeSubTab.slice(0, -1)}</span>
            </button>
          </form>

          {/* Tips Info Panel */}
          <div className="bg-amber-50/50 border border-amber-200/50 p-3.5 rounded-lg flex gap-2 text-[10px] leading-relaxed text-neutral-600">
            <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold uppercase text-[9px] text-amber-800 mb-1">Taxonomy Principle</p>
              <p>Items defined here become instantly searchable, editable, and filtered. Deleting/Archiving an item hides it from active dropdowns but preserves historic product catalog bindings.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Listing Table Panel */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col min-h-[400px]">
          
          {/* Table Toolbar controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4 mb-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                className="w-full bg-neutral-50 px-3 py-2 pl-9 border border-neutral-250 rounded-lg text-xs"
                placeholder={`Search ${activeSubTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Optional Category filter inside subcategories view */}
              {activeSubTab === 'subcategories' && (
                <select
                  className="bg-white border border-neutral-250 rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                  value={subcatCategoryFilter}
                  onChange={(e) => setSubcatCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}

              <label className="flex items-center gap-2 text-xs font-bold text-neutral-500 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 h-3.5 w-3.5"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                />
                <span>Show Archived</span>
              </label>
            </div>
          </div>

          {/* List display */}
          <div className="flex-1 overflow-x-auto">
            {filteredItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center">
                <Info className="h-8 w-8 text-neutral-300 mb-2" />
                <p className="text-xs font-extrabold text-neutral-500 uppercase">No classifications found</p>
                <p className="text-[10px] text-neutral-400 mt-1 max-w-xs">There are no items matching this criteria. Change your filters or add a new entry.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    {activeSubTab === 'subcategories' && <th className="py-2.5 px-3">Category ID / Name</th>}
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredItems.map((item) => {
                    const isEditingThis = editingId === item.id;
                    const itemCategory = activeSubTab === 'subcategories' 
                      ? categories.find(c => c.id === item.categoryId) 
                      : null;

                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-neutral-50/50 transition-colors ${item.isArchived ? 'opacity-60 bg-neutral-50/30' : ''}`}
                      >
                        <td className="py-3 px-3 font-mono text-[10px] text-neutral-400">#{item.id}</td>
                        
                        <td className="py-3 px-3">
                          {isEditingThis ? (
                            <input
                              type="text"
                              className="bg-white border rounded px-2 py-1 text-xs w-full max-w-[200px]"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                            />
                          ) : (
                            <span className="font-extrabold text-neutral-900">{item.name}</span>
                          )}
                        </td>

                        {activeSubTab === 'subcategories' && (
                          <td className="py-3 px-3">
                            {isEditingThis ? (
                              <select
                                className="bg-white border rounded px-2 py-1 text-xs w-full max-w-[150px]"
                                value={editingParentId}
                                onChange={(e) => setEditingParentId(e.target.value)}
                              >
                                {categories.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                                {itemCategory ? `${itemCategory.name} (#${itemCategory.id})` : `Category ID: ${item.categoryId}`}
                              </span>
                            )}
                          </td>
                        )}

                        <td className="py-3 px-3">
                          {item.isArchived ? (
                            <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-extrabold uppercase text-[9px]">Archived</span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-extrabold uppercase text-[9px]">Active</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {isEditingThis ? (
                              <>
                                <button
                                  onClick={() => handleUpdateItem(item.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                  title="Save"
                                >
                                  <Check className="h-4.5 w-4.5" />
                                </button>
                                <button
                                  onClick={() => { setEditingId(null); setEditingName(''); setEditingParentId(''); }}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                  title="Cancel"
                                >
                                  <X className="h-4.5 w-4.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setEditingName(item.name);
                                    if (activeSubTab === 'subcategories') {
                                      setEditingParentId(String(item.categoryId));
                                    }
                                  }}
                                  className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                                  title="Edit"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleArchiveToggle(item)}
                                  className={`p-1 rounded ${
                                    item.isArchived 
                                      ? 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700' 
                                      : 'text-neutral-400 hover:bg-rose-50 hover:text-rose-600'
                                  }`}
                                  title={item.isArchived ? 'Restore' : 'Archive'}
                                >
                                  {item.isArchived ? <RefreshCw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
