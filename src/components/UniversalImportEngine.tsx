import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
  Upload, FileSpreadsheet, FileText, Globe, RefreshCw, CheckCircle, 
  AlertTriangle, XCircle, ArrowRight, Settings, Search, Edit3, 
  Save, History, Trash2, Play, CheckSquare, Square, DollarSign, 
  Eye, Download, Loader2, Plus, Sparkles, X, ChevronRight, HelpCircle,
  ChevronDown
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { calculateSellingPrice, DEFAULT_PRICING_SETTINGS } from '../lib/pricingEngine';

// Supported AddisDubai standard target fields
const ADDIS_DUBAI_FIELDS = [
  { key: 'name', label: 'Product Name *', required: true, fallbackKeys: ['title', 'product name', 'name', 'product_name', 'designation', 'item_name'] },
  { key: 'sku', label: 'SKU / Product Code', required: false, fallbackKeys: ['sku', 'product code', 'code', 'product_code', 'id', 'item number', 'article', 'style_no'] },
  { key: 'priceETB', label: 'Price (Store Currency) *', required: true, fallbackKeys: ['price', 'sale price', 'price_etb', 'priceetb', 'value', 'amount', 'msrp', 'retail'] },
  { key: 'originalPriceETB', label: 'Original / Before Price', required: false, fallbackKeys: ['original price', 'original_price', 'before_price', 'msrp', 'list price', 'regular price', 'compare_at_price'] },
  { key: 'category', label: 'Category', required: false, fallbackKeys: ['category', 'type', 'group', 'class', 'department', 'vertical'] },
  { key: 'subcategory', label: 'Subcategory', required: false, fallbackKeys: ['subcategory', 'sub-category', 'sub_category', 'style', 'sub_type'] },
  { key: 'brand', label: 'Brand', required: false, fallbackKeys: ['brand', 'brand_name', 'manufacturer', 'vendor', 'supplier'] },
  { key: 'description', label: 'Description', required: false, fallbackKeys: ['description', 'desc', 'summary', 'about', 'details', 'body'] },
  { key: 'sizes', label: 'Sizes (Comma split)', required: false, fallbackKeys: ['sizes', 'size', 'dimensions', 'options', 'size_range'] },
  { key: 'colors', label: 'Colors (Comma split)', required: false, fallbackKeys: ['colors', 'color', 'colours', 'colour', 'shades'] },
  { key: 'images', label: 'Images (URLs comma split)', required: false, fallbackKeys: ['images', 'image', 'img', 'picture', 'photo', 'image urls', 'image_url', 'media'] },
];

interface UniversalImportEngineProps {
  currency: string;
  onImportCompleted?: () => void;
}

export default function UniversalImportEngine({ currency, onImportCompleted }: UniversalImportEngineProps) {
  // Navigation & Wizard State
  const [activeStep, setActiveStep] = useState<'SETUP' | 'UPLOAD' | 'MAPPING' | 'PREVIEW' | 'IMPORTING' | 'REPORT' | 'HISTORY'>('SETUP');
  
  // --- Catalog Classification Setup State ---
  const [suppliersList, setSuppliersList] = useState<any[]>([]);
  const [brandsList, setBrandsList] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<any[]>([]);

  const [setupSupplierId, setSetupSupplierId] = useState<number | null>(null);
  const [setupBrandId, setSetupBrandId] = useState<number | null>(null);
  const [setupDepartmentId, setSetupDepartmentId] = useState<number | null>(null);
  const [setupCategoryId, setSetupCategoryId] = useState<number | null>(null);
  const [setupSubcategoryId, setSetupSubcategoryId] = useState<number | null>(null);

  const [brandSearch, setBrandSearch] = useState('');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  // New item creation modals
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  
  // File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState({ name: '', size: 0, rowsCount: 0 });
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [parsedRawData, setParsedRawData] = useState<any[]>([]);
  
  // URL sourcing state
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceUrlSupplier, setSourceUrlSupplier] = useState('');
  const [sourceUrlCategory, setSourceUrlCategory] = useState('dresses');
  const [sourceUrlBrand, setSourceUrlBrand] = useState('');

  // Column Mapping State
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [mappingTemplates, setMappingTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [saveTemplateModal, setSaveTemplateModal] = useState(false);

  // Global Multipliers / Settings State
  const [globalSupplier, setGlobalSupplier] = useState('Generic Supplier');
  const [globalCategory, setGlobalCategory] = useState('');
  const [globalBrand, setGlobalBrand] = useState('');
  const [globalMarkup, setGlobalMarkup] = useState<number>(0);
  const [globalExchangeRate, setGlobalExchangeRate] = useState<number>(1);
  const [globalImportStatus, setGlobalImportStatus] = useState<'Draft' | 'Published'>('Draft');
  
  // Duplicate Detection Strategy
  const [dupCheckField, setDupCheckField] = useState<'sku' | 'name' | 'none'>('sku');
  const [dupStrategy, setDupStrategy] = useState<'skip' | 'update' | 'copy'>('skip');

  // Preview & Editing State
  const [stagedProducts, setStagedProducts] = useState<any[]>([]);
  const [selectedStagedSkus, setSelectedStagedSkus] = useState<string[]>([]);
  const [filterValidation, setFilterValidation] = useState<'all' | 'valid' | 'warning' | 'error'>('all');
  const [previewSearch, setPreviewSearch] = useState('');

  // Import Execution / Engine state
  const [batchSize, setBatchSize] = useState(50);
  const [isImportRunning, setIsImportRunning] = useState(false);
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [cancelRequested, setCancelRequested] = useState(false);

  // Finished Report summary
  const [importReport, setImportReport] = useState({
    filename: '',
    supplier: '',
    duration: 0,
    total: 0,
    imported: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    duplicates: 0,
    errors: [] as string[]
  });

  // History Log States
  const [historyJobs, setHistoryJobs] = useState<any[]>([]);
  const [selectedHistoryJob, setSelectedHistoryJob] = useState<any | null>(null);
  const [selectedHistoryJobItems, setSelectedHistoryJobItems] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // UI state feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Centralized Pricing Settings State
  const [pricingSettings, setPricingSettings] = useState<any>(DEFAULT_PRICING_SETTINGS);
  const [importCurrency, setImportCurrency] = useState<string>('AED');
  const [expandedRowSkus, setExpandedRowSkus] = useState<Record<string, boolean>>({});

  // Initialize templates, history, and classification data
  useEffect(() => {
    fetchTemplates();
    fetchHistory();
    fetchClassifications();
    fetchPricingSettings();
  }, []);

  const fetchPricingSettings = async () => {
    try {
      const data = await apiClient.getSettings();
      if (data) {
        setPricingSettings(data);
      }
    } catch (err) {
      console.error('Failed to load pricing engine settings:', err);
    }
  };

  const fetchClassifications = async () => {
    try {
      const sups = await apiClient.getSuppliers();
      setSuppliersList(sups || []);
      
      const brs = await apiClient.getBrands();
      setBrandsList(brs || []);
      
      const depts = await apiClient.getDepartments();
      setDepartmentsList(depts || []);
      
      const cats = await apiClient.getCategories();
      setCategoriesList(cats || []);
    } catch (err) {
      console.error('Failed to fetch classification lists:', err);
    }
  };

  // Load subcategories dynamically when selected category changes
  useEffect(() => {
    if (setupCategoryId) {
      apiClient.getSubcategories(setupCategoryId)
        .then(subs => {
          setSubcategoriesList(subs || []);
          if (subs && subs.length > 0) {
            // Check if existing subcategory is in list
            const hasExisting = subs.some((s: any) => s.id === setupSubcategoryId);
            if (!hasExisting) {
              setSetupSubcategoryId(null); // Keep it optional by default
            }
          } else {
            setSetupSubcategoryId(null);
          }
        })
        .catch(err => console.error('Failed to load subcategories:', err));
    } else {
      setSubcategoriesList([]);
      setSetupSubcategoryId(null);
    }
  }, [setupCategoryId]);

  // Load presets automatically for selected supplier
  useEffect(() => {
    if (setupSupplierId) {
      const selectedSup = suppliersList.find(s => s.id === setupSupplierId);
      if (selectedSup) {
        apiClient.getSupplierPreset(selectedSup.name)
          .then(res => {
            if (res && res.preset) {
              const { departmentId, brandId, categoryId, subcategoryId } = res.preset;
              if (departmentId) setSetupDepartmentId(departmentId);
              if (brandId) setSetupBrandId(brandId);
              if (categoryId) setSetupCategoryId(categoryId);
              if (subcategoryId) {
                setTimeout(() => {
                  setSetupSubcategoryId(subcategoryId);
                }, 150);
              }
            }
          })
          .catch(err => console.error('Failed to fetch supplier preset:', err));
      }
    }
  }, [setupSupplierId, suppliersList]);

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) return;
    try {
      const created = await apiClient.createSupplier(newSupplierName.trim());
      setSuppliersList(prev => [...prev, created]);
      setSetupSupplierId(created.id);
      setNewSupplierName('');
      setShowAddSupplierModal(false);
      setSuccessMessage(`Supplier "${created.name}" created!`);
      setTimeout(() => setSuccessMessage(''), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create supplier');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      const created = await apiClient.createBrand(newBrandName.trim());
      setBrandsList(prev => [...prev, created]);
      setSetupBrandId(created.id);
      setNewBrandName('');
      setShowAddBrandModal(false);
      setSuccessMessage(`Brand "${created.name}" created!`);
      setTimeout(() => setSuccessMessage(''), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create brand');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await apiClient.getImportTemplates();
      setMappingTemplates(data || []);
    } catch (e) {
      console.error('Failed to fetch templates:', e);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await apiClient.getImportHistory();
      setHistoryJobs(data || []);
    } catch (e) {
      console.error('Failed to fetch import history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Drag and Drop Handling
  const [isDragActive, setIsDragActive] = useState(false);
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Parse CSV / Excel
  const processSelectedFile = (file: File) => {
    setErrorMessage('');
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'csv' && extension !== 'xlsx' && extension !== 'xls') {
      setErrorMessage('Unsupported file format. Please upload a .csv, .xlsx, or .xls file.');
      return;
    }

    setSelectedFile(file);
    setFileDetails({
      name: file.name,
      size: file.size,
      rowsCount: 0
    });

    if (extension === 'csv') {
      parseCSV(file);
    } else {
      parseExcel(file);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setErrorMessage('Corrupted CSV or missing headers row. Check the file structure.');
          return;
        }
        
        const headers = results.meta.fields || [];
        if (headers.length === 0) {
          setErrorMessage('Empty or invalid CSV file: Header row not detected.');
          return;
        }

        setFileHeaders(headers);
        setParsedRawData(results.data);
        setFileDetails(prev => ({ ...prev, rowsCount: results.data.length }));
        autoDetectColumns(headers, results.data);
      },
      error: (err) => {
        setErrorMessage('Failed to parse CSV: ' + err.message);
      }
    });
  };

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        if (workbook.SheetNames.length === 0) {
          setErrorMessage('Empty excel workbook: No sheets found.');
          return;
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        if (rawJson.length === 0) {
          setErrorMessage('No rows detected in the Excel sheet.');
          return;
        }

        const headers = Object.keys(rawJson[0]);
        setFileHeaders(headers);
        setParsedRawData(rawJson);
        setFileDetails(prev => ({ ...prev, rowsCount: rawJson.length }));
        autoDetectColumns(headers, rawJson);
      } catch (err: any) {
        setErrorMessage('Failed to parse Excel file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Step 3 - Automatic Column Detection
  const autoDetectColumns = (headers: string[], rawRows: any[]) => {
    const detectedMappings: Record<string, string> = {};
    
    ADDIS_DUBAI_FIELDS.forEach(field => {
      // Find case-insensitive close match
      const matchedHeader = headers.find(h => {
        const lowerH = h.toLowerCase().trim().replace(/[\s_-]/g, '');
        return field.fallbackKeys.some(fKey => {
          const lowerF = fKey.toLowerCase().trim().replace(/[\s_-]/g, '');
          return lowerH === lowerF || lowerH.includes(lowerF) || lowerF.includes(lowerH);
        });
      });
      if (matchedHeader) {
        detectedMappings[field.key] = matchedHeader;
      } else {
        detectedMappings[field.key] = ''; // Blank manual mapping
      }
    });

    setColumnMappings(detectedMappings);
    
    // Auto populate default supplier name from file
    const friendlyName = selectedFile?.name 
      ? selectedFile.name.replace(/\.[^/.]+$/, "").split(/[-_]/)[0]
      : 'Generic Supplier';
    
    // Capitalize first letter
    setGlobalSupplier(friendlyName.charAt(0).toUpperCase() + friendlyName.slice(1));
    setActiveStep('MAPPING');
  };

  // Step 4 - Mapping Templates Management
  const applyTemplate = (templateId: string) => {
    const template = mappingTemplates.find(t => String(t.id) === templateId);
    if (template && template.mapping) {
      const appliedMap: Record<string, string> = {};
      ADDIS_DUBAI_FIELDS.forEach(f => {
        // Ensure mapped column actually exists in current file
        const savedCol = template.mapping[f.key];
        if (savedCol && fileHeaders.includes(savedCol)) {
          appliedMap[f.key] = savedCol;
        } else {
          // Fall back to auto detect if template mapping isn't found in current file headers
          const autoVal = columnMappings[f.key];
          appliedMap[f.key] = autoVal || '';
        }
      });
      setColumnMappings(appliedMap);
      setSelectedTemplateId(templateId);
      setSuccessMessage(`Mapping template "${template.name}" applied successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) return;
    try {
      await apiClient.saveImportTemplate(newTemplateName, columnMappings);
      setNewTemplateName('');
      setSaveTemplateModal(false);
      await fetchTemplates();
      setSuccessMessage('Mapping template saved successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e: any) {
      setErrorMessage('Failed to save mapping template: ' + e.message);
    }
  };

  // Step 5 & 6 & 7 & 8 - Map, Validate, Price Calculation & Preview Staging
  const handleCompileStaging = () => {
    setErrorMessage('');
    
    // Check required mapped fields
    const nameCol = columnMappings['name'];
    const priceCol = columnMappings['priceETB'];
    
    if (!nameCol) {
      setErrorMessage('Validation Error: Product Name target field must be mapped to a file column.');
      return;
    }
    if (!priceCol) {
      setErrorMessage('Validation Error: Price target field must be mapped to a file column.');
      return;
    }

    const compiled: any[] = [];
    const generatedSkus = new Set<string>();

    parsedRawData.forEach((row, index) => {
      const rawName = row[nameCol]?.toString().trim() || '';
      const rawSku = columnMappings['sku'] ? (row[columnMappings['sku']]?.toString().trim() || '') : '';
      const rawPrice = row[priceCol] ? parseFloat(row[priceCol].toString().replace(/[^0-9.]/g, '')) : 0;
      
      const originalPriceCol = columnMappings['originalPriceETB'];
      const rawOriginalPrice = originalPriceCol && row[originalPriceCol]
        ? parseFloat(row[originalPriceCol].toString().replace(/[^0-9.]/g, ''))
        : 0;

      const categoryCol = columnMappings['category'];
      const rawCategory = categoryCol ? (row[categoryCol]?.toString().trim() || '') : '';

      const subcategoryCol = columnMappings['subcategory'];
      const rawSubcategory = subcategoryCol ? (row[subcategoryCol]?.toString().trim() || '') : '';

      const brandCol = columnMappings['brand'];
      const rawBrand = brandCol ? (row[brandCol]?.toString().trim() || '') : '';

      const descCol = columnMappings['description'];
      const rawDesc = descCol ? (row[descCol]?.toString().trim() || '') : '';

      // Array/JSON parsers for Sizes, Colors, Images
      const sizesCol = columnMappings['sizes'];
      const sizesVal = sizesCol && row[sizesCol] ? row[sizesCol].toString().split(',').map((s: string) => s.trim()).filter(Boolean) : [];

      const colorsCol = columnMappings['colors'];
      let colorsVal: any[] = [];
      if (colorsCol && row[colorsCol]) {
        colorsVal = row[colorsCol].toString().split(',').map((c: string) => {
          const name = c.trim();
          // Map basic colors to simple hex values
          const basicColors: Record<string, string> = {
            black: '#111111', white: '#ffffff', red: '#ff0000', blue: '#0000ff', 
            green: '#00ff00', yellow: '#ffff00', gold: '#d4af37', pink: '#ffc0cb',
            grey: '#808080', gray: '#808080', silver: '#c0c0c0', brown: '#a52a2a'
          };
          const hex = basicColors[name.toLowerCase()] || '#808080';
          return { name, hex };
        }).filter(Boolean);
      }

      const imagesCol = columnMappings['images'];
      const imagesVal = imagesCol && row[imagesCol] ? row[imagesCol].toString().split(',').map((img: string) => img.trim()).filter((url: string) => url.startsWith('http')) : [];

      // Generate a structured temporary SKU if missing
      let finalSku = rawSku;
      if (!finalSku) {
        const cleanName = rawName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        finalSku = `IMP-${cleanName || 'PROD'}-${1000 + index}`;
      }

      // Check duplication in current import file
      let localSkuDuplicate = false;
      if (generatedSkus.has(finalSku)) {
        localSkuDuplicate = true;
        finalSku = `${finalSku}-DUP-${index}`;
      }
      generatedSkus.add(finalSku);

      // Apply Centralized Pricing Engine calculations
      const pricingBreakdown = calculateSellingPrice(rawPrice, importCurrency, pricingSettings);
      const calculatedPrice = pricingBreakdown.roundedTotalETB;

      let calculatedOriginalPrice = null;
      if (rawOriginalPrice) {
        const originalBreakdown = calculateSellingPrice(rawOriginalPrice, importCurrency, pricingSettings);
        calculatedOriginalPrice = originalBreakdown.roundedTotalETB;
      }

      if (isNaN(calculatedPrice) || calculatedPrice <= 0) {
        calculatedPrice = 100; // safety fallback
      }

      // Step 5: Item validation flags
      const validation = {
        status: 'valid' as 'valid' | 'warning' | 'error',
        messages: [] as string[]
      };

      if (!rawName) {
        validation.status = 'error';
        validation.messages.push('Product Name is required.');
      }
      if (rawPrice <= 0) {
        validation.status = 'error';
        validation.messages.push('Supplier price is missing or invalid.');
      }
      if (localSkuDuplicate) {
        validation.status = 'warning';
        validation.messages.push('Duplicate SKU found in file (adjusted to prevent database conflict).');
      }
      if (!rawCategory && !globalCategory) {
        validation.status = 'warning';
        validation.messages.push('Category is missing (AddisDubai catalog requires categories).');
      }
      if (!rawBrand && !globalBrand) {
        validation.status = 'warning';
        validation.messages.push('Brand is empty.');
      }
      if (imagesVal.length === 0) {
        validation.status = 'warning';
        validation.messages.push('No valid image URLs detected.');
      }

      const selectedSup = suppliersList.find(s => s.id === setupSupplierId);
      const selectedBrandObj = brandsList.find(b => b.id === setupBrandId);
      const selectedCat = categoriesList.find(c => c.id === setupCategoryId);
      const selectedSubcat = subcategoriesList.find(s => s.id === setupSubcategoryId);

      // Classification is considered blank/incomplete if any of the optional fields (Supplier, Brand, Department, Main Category, Subcategory) are left blank
      const isClassificationBlank = !setupSupplierId || !setupBrandId || !setupDepartmentId || !setupCategoryId || !setupSubcategoryId;
      const finalStatus = isClassificationBlank ? 'Draft' : globalImportStatus;

      compiled.push({
        id: index,
        name: rawName,
        sku: finalSku,
        originalSku: rawSku,
        supplierPrice: rawPrice,
        supplierCurrency: importCurrency,
        priceETB: calculatedPrice,
        originalPriceETB: calculatedOriginalPrice,
        exchangeRateUsed: pricingBreakdown.exchangeRateUsed,
        shippingPercentageUsed: pricingSettings.shippingPercentage,
        handlingPercentageUsed: pricingSettings.handlingPercentage,
        riskBufferPercentageUsed: pricingSettings.riskBufferPercentage,
        profitPercentageUsed: pricingSettings.profitPercentage,
        fixedFeeUsed: pricingSettings.fixedFeeETB,
        calculatedSellingPriceETB: calculatedPrice,
        calculatedAt: new Date().toISOString(),
        pricingBreakdown,
        category: rawCategory || selectedCat?.name || globalCategory || 'dresses',
        subcategory: rawSubcategory || selectedSubcat?.name || 'imported',
        brand: rawBrand || selectedBrandObj?.name || globalBrand || selectedSup?.name || 'Generic Supplier',
        description: rawDesc,
        sizes: sizesVal.length > 0 ? sizesVal : ['S', 'M', 'L', 'XL'],
        colors: colorsVal.length > 0 ? colorsVal : [{ name: 'Classic Black', hex: '#111111' }],
        images: imagesVal.length > 0 ? imagesVal : ['https://placehold.co/600x800/png?text=' + encodeURIComponent(rawName)],
        quantityAvailable: 10,
        status: finalStatus,
        supplierId: setupSupplierId || null,
        brandId: setupBrandId || null,
        departmentId: setupDepartmentId || null,
        categoryId: setupCategoryId || null,
        subcategoryId: setupSubcategoryId || null,
        validation
      });
    });

    setStagedProducts(compiled);
    setSelectedStagedSkus(compiled.map(p => p.sku)); // select all by default
    setActiveStep('PREVIEW');
  };

  // Sourcing Crawled URL specs
  const handleUrlSourcing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceUrl) return;
    setErrorMessage('');
    
    // Inline URL safety check
    try {
      const parsed = new URL(sourceUrl);
      const hostname = parsed.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname.endsWith('.local') ||
        hostname.endsWith('.internal') ||
        hostname === '127.0.0.1' ||
        hostname === '::1'
      ) {
        setErrorMessage('SSRF blocked: Insecure or internal loopback source routes are forbidden.');
        return;
      }
    } catch {
      setErrorMessage('Invalid Source URL.');
      return;
    }

    setIsImportRunning(true);
    setImportLogs(['[INFO] Querying active crawler engine...']);
    setImportProgress(10);
    
    try {
      const res = await apiClient.importProducts({
        supplierUrl: sourceUrl,
        supplierName: sourceUrlSupplier,
        category: sourceUrlCategory,
        brand: sourceUrlBrand
      });

      setImportProgress(100);
      setImportLogs(prev => [...prev, `[SUCCESS] Loaded ${res.products?.length || 0} items dynamically.`]);
      
      if (res.products && res.products.length > 0) {
        // Convert to import staging structure
        const isClassificationBlank = !setupSupplierId || !setupBrandId || !setupDepartmentId || !setupCategoryId || !setupSubcategoryId;
        const finalStatus = isClassificationBlank ? 'Draft' : globalImportStatus;

        const formatted = res.products.map((p: any, index: number) => ({
          id: index,
          name: p.name,
          sku: p.sku || `SRC-${Math.floor(10000 + Math.random() * 90000)}`,
          originalSku: p.sku || '',
          supplierPrice: p.priceETB,
          priceETB: p.priceETB,
          originalPriceETB: p.originalPriceETB || null,
          category: p.category || sourceUrlCategory,
          subcategory: p.subcategory || 'crawled',
          brand: p.brand || sourceUrlBrand || sourceUrlSupplier || 'Imported',
          description: p.description || '',
          sizes: p.sizes || ['M', 'L'],
          colors: p.colors || [{ name: 'Classic Black', hex: '#111111' }],
          images: p.images || [],
          quantityAvailable: 10,
          status: finalStatus,
          supplierId: setupSupplierId || null,
          brandId: setupBrandId || null,
          departmentId: setupDepartmentId || null,
          categoryId: setupCategoryId || null,
          subcategoryId: setupSubcategoryId || null,
          validation: { status: 'valid', messages: [] }
        }));

        setStagedProducts(formatted);
        setSelectedStagedSkus(formatted.map((p: any) => p.sku));
        setIsImportRunning(false);
        setActiveStep('PREVIEW');
      } else {
        throw new Error('No items fetched from the provided URL specifications.');
      }
    } catch (err: any) {
      setIsImportRunning(false);
      setErrorMessage(err.message || 'Sourcing portal timeout. Try another URL pathway.');
    }
  };

  // Inline Cell Editing (Step 6)
  const handleInlineEdit = (id: number, key: string, value: any) => {
    setStagedProducts(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [key]: value };
        
        // Track manual overrides
        if (key === 'priceETB') {
          updated.isOverridden = true;
          updated.calculatedSellingPriceETB = item.calculatedSellingPriceETB || item.priceETB;
        }
        
        // Re-validate row on value change
        const messages: string[] = [];
        let status: 'valid' | 'warning' | 'error' = 'valid';

        if (!updated.name) {
          status = 'error';
          messages.push('Product Name is required.');
        }
        
        const numericPrice = parseFloat(updated.priceETB);
        if (isNaN(numericPrice) || numericPrice <= 0) {
          status = 'error';
          messages.push('Price must be a positive number.');
        }

        if (!updated.category) {
          status = 'warning';
          messages.push('Missing category.');
        }

        updated.validation = { status, messages };
        return updated;
      }
      return item;
    }));
  };

  const toggleRowExpand = (sku: string) => {
    setExpandedRowSkus(prev => ({
      ...prev,
      [sku]: !prev[sku]
    }));
  };

  // Select item helpers
  const handleSelectItem = (sku: string, checked: boolean) => {
    if (checked) {
      setSelectedStagedSkus(prev => [...prev, sku]);
    } else {
      setSelectedStagedSkus(prev => prev.filter(s => s !== sku));
    }
  };

  const handleSelectAllStaged = (checked: boolean) => {
    if (checked) {
      setSelectedStagedSkus(stagedProducts.map(p => p.sku));
    } else {
      setSelectedStagedSkus([]);
    }
  };

  // Filter & Search staging items
  const filteredStagedProducts = stagedProducts.filter(p => {
    // Search
    const matchesSearch = p.name.toLowerCase().includes(previewSearch.toLowerCase()) || 
                          p.sku.toLowerCase().includes(previewSearch.toLowerCase()) || 
                          p.brand.toLowerCase().includes(previewSearch.toLowerCase());
    
    // Validation filter
    if (filterValidation === 'all') return matchesSearch;
    return matchesSearch && p.validation.status === filterValidation;
  });

  // Calculate totals for Preview
  const previewStats = {
    total: stagedProducts.length,
    valid: stagedProducts.filter(p => p.validation.status === 'valid').length,
    warning: stagedProducts.filter(p => p.validation.status === 'warning').length,
    error: stagedProducts.filter(p => p.validation.status === 'error').length,
    selected: selectedStagedSkus.length
  };

  // Step 9: Launch Import Engine / Bulk Publisher
  const handleLaunchImport = async () => {
    const selectedItems = stagedProducts.filter(p => selectedStagedSkus.includes(p.sku));
    
    if (selectedItems.length === 0) {
      setErrorMessage('No products selected for import. Check items inside the preview staging area.');
      return;
    }

    // Check for blocking errors in selected items
    const hasBlockingErrors = selectedItems.some(p => p.validation.status === 'error');
    if (hasBlockingErrors) {
      setErrorMessage('Please fix all red Error rows before launching the import process.');
      return;
    }

    setIsImportRunning(true);
    setCancelRequested(false);
    setImportLogs([]);
    setImportProgress(0);
    setActiveStep('IMPORTING');

    const startTime = Date.now();
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    let duplicates = 0;
    const errors: string[] = [];
    const savedItemsHistory: any[] = [];

    const totalToProcess = selectedItems.length;
    setImportLogs(prev => [...prev, `[INIT] Starting import engine at ${new Date().toLocaleTimeString()}`]);
    setImportLogs(prev => [...prev, `[INIT] Queueing ${totalToProcess} staged items. Batch size set to ${batchSize}.`]);

    // Split into batches
    for (let i = 0; i < totalToProcess; i += batchSize) {
      if (cancelRequested) {
        setImportLogs(prev => [...prev, `[WARN] Cancel signal received. Stopping gracefully...`]);
        skipped += (totalToProcess - i);
        break;
      }

      const batch = selectedItems.slice(i, i + batchSize);
      setImportLogs(prev => [...prev, `[BATCH] Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} items)...`]);

      try {
        // Step 8: Duplicate detection check & server-side alignment
        // In real database we will hit the bulk API
        // For duplicates: we check each SKU locally in staging or online
        // Let's call our transaction-ready backend API
        const response = await apiClient.bulkCreateProducts(batch);
        
        imported += batch.length;
        batch.forEach(item => {
          savedItemsHistory.push({
            sku: item.sku,
            name: item.name,
            status: 'Imported'
          });
        });

        setImportLogs(prev => [...prev, `[SUCCESS] Created ${batch.length} products in current batch.`]);
      } catch (err: any) {
        failed += batch.length;
        errors.push(`Batch starting at index ${i} failed: ${err.message}`);
        setImportLogs(prev => [...prev, `[ERROR] Batch processing failed: ${err.message}`]);

        batch.forEach(item => {
          savedItemsHistory.push({
            sku: item.sku,
            name: item.name,
            status: 'Failed',
            errorMessage: err.message
          });
        });
      }

      // Update progress
      const progressPercent = Math.round(((i + batch.length) / totalToProcess) * 100);
      setImportProgress(progressPercent);
      
      // Artificial minor delay to prevent blocking thread & allow UI redraws
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const duration = Date.now() - startTime;
    const finalStatus = failed === totalToProcess ? 'Failed' : 'Completed';

    // Log the entire Job in DB (Step 11 & 12)
    const reportData = {
      filename: selectedFile ? selectedFile.name : 'URL Crawled Import',
      supplier: globalSupplier || 'Generic',
      status: finalStatus,
      duration,
      totalRows: totalToProcess,
      importedCount: imported,
      updatedCount: updated,
      skippedCount: skipped,
      failedCount: failed,
      duplicateCount: duplicates,
      errorLog: errors.join('\n'),
      items: savedItemsHistory
    };

    try {
      await apiClient.createImportJob(reportData);
    } catch (e: any) {
      setImportLogs(prev => [...prev, `[WARN] Failed to write import summary logs into the database: ${e.message}`]);
    }

    // Prepare report screen states (Step 10)
    setImportReport({
      filename: reportData.filename,
      supplier: reportData.supplier,
      duration,
      total: totalToProcess,
      imported,
      updated,
      skipped,
      failed,
      duplicates,
      errors
    });

    setIsImportRunning(false);
    setActiveStep('REPORT');
    if (onImportCompleted) {
      onImportCompleted();
    }
    fetchHistory();
  };

  // Download detailed Error Report helper
  const handleDownloadErrorReport = () => {
    const content = `ADDISDUBAI IMPORT SYSTEM ERROR REPORT
Job File: ${importReport.filename}
Supplier: ${importReport.supplier}
Total Rows Sourced: ${importReport.total}
Succeeded: ${importReport.imported}
Failed: ${importReport.failed}
Time Elapsed: ${(importReport.duration / 1000).toFixed(2)}s

--------------------------------------------
ERRORS ENCOUNTERED:
${importReport.errors.length > 0 ? importReport.errors.join('\n') : 'No runtime backend errors. Check individual row statuses.'}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-error-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // View specific History item report modal/details
  const handleViewHistoryReport = async (job: any) => {
    setSelectedHistoryJob(job);
    try {
      const items = await apiClient.getImportJobItems(job.id);
      setSelectedHistoryJobItems(items || []);
    } catch (e) {
      setSelectedHistoryJobItems([]);
    }
  };

  // Delete Job Log (Step 11)
  const handleDeleteHistoryLog = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this import history entry?')) return;
    try {
      await apiClient.deleteImportJob(id);
      await fetchHistory();
    } catch (e: any) {
      alert('Failed to delete history log: ' + e.message);
    }
  };

  return (
    <div className="w-full text-neutral-800 space-y-6">
      
      {/* Dynamic Alerts */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-250 p-4 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2.5">
          <XCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2.5">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Modern Horizontal Wizard Step Tracker */}
      <div className="bg-white px-5 py-3 border border-neutral-200/70 shadow-sm rounded-xl flex items-center justify-between overflow-x-auto whitespace-nowrap select-none scrollbar-none gap-6">
        <div className="flex items-center gap-2 text-xs font-black tracking-wide text-neutral-900">
          <Sparkles className="h-4.5 w-4.5 text-amber-500" />
          <span>Universal Import Engine</span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 text-xs font-bold">
          <button 
            onClick={() => setActiveStep('SETUP')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${activeStep === 'SETUP' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
          >
            <span className="h-4.5 w-4.5 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center font-mono text-[9px] font-black">1</span>
            <span>Classification</span>
          </button>

          <ChevronRight className="h-3 w-3 text-neutral-300" />

          <button 
            onClick={() => setActiveStep('UPLOAD')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${activeStep === 'UPLOAD' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
          >
            <span className="h-4.5 w-4.5 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center font-mono text-[9px] font-black">2</span>
            <span>Upload</span>
          </button>
          
          <ChevronRight className="h-3 w-3 text-neutral-300" />

          <button 
            disabled={!selectedFile}
            onClick={() => setActiveStep('MAPPING')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${activeStep === 'MAPPING' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
          >
            <span className="h-4.5 w-4.5 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center font-mono text-[9px] font-black">3</span>
            <span>Map Fields</span>
          </button>

          <ChevronRight className="h-3 w-3 text-neutral-300" />

          <button 
            disabled={stagedProducts.length === 0}
            onClick={() => setActiveStep('PREVIEW')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${activeStep === 'PREVIEW' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
          >
            <span className="h-4.5 w-4.5 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center font-mono text-[9px] font-black">4</span>
            <span>Staging Workspace</span>
          </button>

          <ChevronRight className="h-3 w-3 text-neutral-300" />

          <button 
            onClick={() => setActiveStep('HISTORY')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${activeStep === 'HISTORY' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
          >
            <History className="h-3.5 w-3.5" />
            <span>History logs</span>
          </button>
        </div>
      </div>

      {/* WIZARD SCREENS */}

      {/* 1. SETUP STEP */}
      {activeStep === 'SETUP' && (
        <div className="max-w-3xl mx-auto bg-white border border-neutral-200/75 shadow-md rounded-xl overflow-hidden">
          <div className="bg-neutral-50 px-6 py-5 border-b border-neutral-200">
            <h3 className="text-sm font-black uppercase text-neutral-900 tracking-wider flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-neutral-500 animate-spin-slow" />
              <span>Step 1: Product Classification Setup</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Select or create metadata classifications to normalize supplier items before uploading.
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-neutral-400 tracking-wider">Supplier (Optional)</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 bg-white border border-neutral-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-black"
                    value={setupSupplierId || ''}
                    onChange={(e) => setSetupSupplierId(Number(e.target.value) || null)}
                  >
                    <option value="">-- Select Supplier (Optional) --</option>
                    {suppliersList.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddSupplierModal(true)}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-250 rounded-lg text-neutral-600 text-xs font-black uppercase tracking-wider flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>

              {/* Brand Searchable Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-black uppercase text-neutral-400 tracking-wider">Brand (Optional)</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      className="w-full bg-white border border-neutral-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-black"
                      placeholder="Search or select brand..."
                      value={brandSearch}
                      onFocus={() => setIsBrandDropdownOpen(true)}
                      onChange={(e) => {
                        setBrandSearch(e.target.value);
                        setIsBrandDropdownOpen(true);
                      }}
                    />
                    {isBrandDropdownOpen && (
                      <div className="absolute z-20 w-full bg-white border border-neutral-200 shadow-lg rounded-lg max-h-48 overflow-y-auto mt-1 text-xs">
                        {brandsList
                          .filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                          .map(b => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                setSetupBrandId(b.id);
                                setBrandSearch(b.name);
                                setIsBrandDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-neutral-50 font-semibold border-b border-neutral-100 last:border-0"
                            >
                              {b.name}
                            </button>
                          ))}
                        {brandsList.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase())).length === 0 && (
                          <div className="px-3 py-2 text-neutral-400 font-medium">No brands found</div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddBrandModal(true)}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-250 rounded-lg text-neutral-600 text-xs font-black uppercase tracking-wider flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New</span>
                  </button>
                </div>
                {setupBrandId && !isBrandDropdownOpen && (
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                    Selected Brand: {brandsList.find(b => b.id === setupBrandId)?.name}
                  </span>
                )}
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-neutral-400 tracking-wider">Department (Optional)</label>
                <select
                  className="w-full bg-white border border-neutral-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-black"
                  value={setupDepartmentId || ''}
                  onChange={(e) => setSetupDepartmentId(Number(e.target.value) || null)}
                >
                  <option value="">-- Select Department (Optional) --</option>
                  {departmentsList.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Main Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-neutral-400 tracking-wider">Main Category (Optional)</label>
                <select
                  className="w-full bg-white border border-neutral-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-black"
                  value={setupCategoryId || ''}
                  onChange={(e) => setSetupCategoryId(Number(e.target.value) || null)}
                >
                  <option value="">-- Select Main Category (Optional) --</option>
                  {categoriesList.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black uppercase text-neutral-400 tracking-wider">Subcategory (Optional)</label>
                <select
                  className="w-full bg-white border border-neutral-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-black"
                  value={setupSubcategoryId || ''}
                  onChange={(e) => setSetupSubcategoryId(Number(e.target.value) || null)}
                  disabled={!setupCategoryId}
                >
                  <option value="">-- Select Subcategory (Optional) --</option>
                  {subcategoriesList.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {!setupCategoryId && (
                  <span className="text-[10px] text-neutral-400 font-medium block mt-1 leading-normal">
                    Please select a Main Category first to load its subcategories dynamically.
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  // Save supplier preset automatically if supplier is bound
                  const selectedSup = suppliersList.find(s => s.id === setupSupplierId);
                  if (selectedSup) {
                    apiClient.saveSupplierPreset(selectedSup.name, {
                      departmentId: setupDepartmentId,
                      brandId: setupBrandId,
                      categoryId: setupCategoryId,
                      subcategoryId: setupSubcategoryId
                    }).catch(err => console.error('Failed to save supplier preset:', err));
                    
                    // Also bind global settings for backwards compatibility
                    setGlobalSupplier(selectedSup.name);
                    const selectedBrandObj = brandsList.find(b => b.id === setupBrandId);
                    if (selectedBrandObj) setGlobalBrand(selectedBrandObj.name);
                    const selectedCatObj = categoriesList.find(c => c.id === setupCategoryId);
                    if (selectedCatObj) setGlobalCategory(selectedCatObj.name);
                  }

                  // Transition to Upload
                  setActiveStep('UPLOAD');
                }}
                className="bg-neutral-900 text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2"
              >
                <span>Continue to Upload File</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 2. UPLOAD SCREEN */}
      {activeStep === 'UPLOAD' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Upload Box */}
          <div className="lg:col-span-2 bg-white p-6 border border-neutral-200/70 rounded-xl shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase text-neutral-900 flex items-center gap-2">
                <Upload className="h-4.5 w-4.5 text-neutral-500" />
                <span>Upload Product Catalog</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Support high-speed bulk parsing for exported supplier lists, Shopify templates, Thunderbit exports, and Ultimate Web Scraper CSVs.
              </p>
            </div>

            {/* Drag & Drop Area (Step 2) */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragActive ? 'border-amber-500 bg-amber-50/20' : 'border-neutral-250 hover:border-black'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
              <div className="h-12 w-12 bg-neutral-50 text-neutral-400 rounded-xl flex items-center justify-center mb-3 shadow-inner">
                <FileSpreadsheet className="h-6 w-6 text-neutral-600" />
              </div>
              <h4 className="text-xs font-extrabold text-neutral-900 uppercase">Drag & Drop file here or Browse</h4>
              <p className="text-[11px] text-neutral-400 mt-1">Supports CSV, Excel (.xlsx, .xls) files up to 25MB.</p>
              
              {/* Sourced formats tags */}
              <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-bold text-[9px] uppercase font-mono">Thunderbit CSV</span>
                <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-bold text-[9px] uppercase font-mono">Web Scraper Export</span>
                <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-bold text-[9px] uppercase font-mono">Shopify XML/CSV</span>
              </div>
            </div>

            {/* Display Selected File specifications */}
            {selectedFile && (
              <div className="bg-neutral-50 border border-neutral-200/70 p-4 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-neutral-900">{fileDetails.name}</h5>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      {(fileDetails.size / 1024).toFixed(1)} KB • {fileDetails.rowsCount} rows detected
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedFile(null);
                    setFileHeaders([]);
                    setParsedRawData([]);
                  }}
                  className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {/* Proceed to map buttons */}
            {selectedFile && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStep('MAPPING')}
                  className="bg-neutral-950 text-white font-black text-[10px] uppercase tracking-wider py-3 px-5 rounded-lg hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2"
                >
                  <span>Configure Column Mappings</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Crawler URL Option (Sourcing from URL - Step 1) */}
          <div className="bg-white p-5 border border-neutral-200/70 rounded-xl shadow-sm space-y-4 h-fit">
            <div className="space-y-1">
              <span className="text-[9.5px] font-black text-amber-500 tracking-wider uppercase block">Option 3</span>
              <h3 className="text-xs font-black uppercase text-neutral-900 flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-neutral-500" />
                <span>Import Sourced URL</span>
              </h3>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Directly retrieve catalogue specification schemas via our supplier crawler portal.
              </p>
            </div>

            <form onSubmit={handleUrlSourcing} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-neutral-500 uppercase">Sourcing Portal URL *</label>
                <input 
                  type="url" 
                  required 
                  placeholder="e.g. https://www.supplier.com/dresses" 
                  className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg text-xs focus:outline-none focus:border-black font-semibold"
                  value={sourceUrl}
                  onChange={e => setSourceUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-neutral-500 uppercase">Supplier Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. SHEIN, Zara Dubai" 
                  className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg text-xs"
                  value={sourceUrlSupplier}
                  onChange={e => setSourceUrlSupplier(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-neutral-500 uppercase">Sourced Category *</label>
                <select 
                  className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg text-xs"
                  value={sourceUrlCategory}
                  onChange={e => setSourceUrlCategory(e.target.value)}
                >
                  <option value="dresses">Dresses</option>
                  <option value="abayas">Abayas</option>
                  <option value="handbags">Handbags</option>
                  <option value="shoes">Shoes</option>
                  <option value="beauty">Beauty</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="watches">Watches</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-neutral-500 uppercase">Brand Tag</label>
                <input 
                  type="text" 
                  placeholder="e.g. Royal Fashion" 
                  className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg text-xs"
                  value={sourceUrlBrand}
                  onChange={e => setSourceUrlBrand(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={isImportRunning || !sourceUrl}
                className="w-full bg-neutral-900 hover:bg-amber-500 hover:text-black font-black uppercase text-[10px] tracking-wider py-2.5 rounded-lg text-white transition-all flex items-center justify-center gap-2 shadow"
              >
                {isImportRunning ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Crawl-sourcing Specs...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-current" />
                    <span>Import From Source URL</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. MAPPING SCREEN (Step 4) */}
      {activeStep === 'MAPPING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Main Mapping Config */}
          <div className="lg:col-span-2 bg-white p-6 border border-neutral-200/70 rounded-xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase text-neutral-900 flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5 text-neutral-500" />
                  <span>Column Field Mappings</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Align supplier spreadsheet headers with AddisDubai standard database parameters.
                </p>
              </div>

              {/* Mapping template picker (Step 4) */}
              <div className="flex items-center gap-2">
                <select
                  className="bg-neutral-50 border border-neutral-250 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider focus:outline-none"
                  value={selectedTemplateId}
                  onChange={(e) => applyTemplate(e.target.value)}
                >
                  <option value="">-- Load Mapping Template --</option>
                  {mappingTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setSaveTemplateModal(true)}
                  className="p-2 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-600"
                  title="Save mapping template"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mappings Grid Column Mapper */}
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 text-[10px] font-black uppercase text-neutral-400 tracking-wider px-2 pb-1 border-b">
                <span>AddisDubai Field Specifications</span>
                <span>Supplier Spreadsheet Column Header</span>
              </div>
              
              {ADDIS_DUBAI_FIELDS.map((field) => (
                <div 
                  key={field.key} 
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-2 rounded-lg hover:bg-neutral-50/70 border border-transparent hover:border-neutral-200/30 transition-all text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-extrabold text-neutral-900 flex items-center gap-1.5">
                      {field.label}
                      {field.required && <span className="text-rose-500 font-bold">*</span>}
                    </span>
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">Column fallback: {field.fallbackKeys.slice(0, 3).join(', ')}</span>
                  </div>

                  <select
                    className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg text-xs font-semibold"
                    value={columnMappings[field.key] || ''}
                    onChange={(e) => setColumnMappings(prev => ({ ...prev, [field.key]: e.target.value }))}
                  >
                    <option value="">-- Ignore Field / Manual Input --</option>
                    {fileHeaders.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Save Template Modal overlay */}
            {saveTemplateModal && (
              <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-neutral-200 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h4 className="text-xs font-black uppercase text-neutral-900">Save Mapping Template</h4>
                    <button onClick={() => setSaveTemplateModal(false)}><X className="h-4 w-4 text-neutral-400" /></button>
                  </div>
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-neutral-600">Template Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Thunderbit Sourced Dresses"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={newTemplateName}
                      onChange={e => setNewTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => setSaveTemplateModal(false)} 
                      className="px-3.5 py-1.5 rounded-lg border text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveTemplate} 
                      className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold"
                      disabled={!newTemplateName.trim()}
                    >
                      Save Template
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Back & Next Actions */}
            <div className="flex justify-between border-t pt-4">
              <button 
                onClick={() => setActiveStep('UPLOAD')}
                className="px-4 py-2 border border-neutral-250 rounded-lg text-xs font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Back to Upload
              </button>
              
              <button
                onClick={handleCompileStaging}
                className="bg-neutral-950 text-white font-black text-[10px] uppercase tracking-wider py-3 px-5 rounded-lg hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2"
              >
                <span>Stage and Preview</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column Markup Multipliers & Settings Panel (Step 7) */}
          <div className="bg-white p-5 border border-neutral-200/70 rounded-xl shadow-sm space-y-5 h-fit text-xs">
            <h3 className="text-xs font-black uppercase text-neutral-900 flex items-center gap-2 border-b pb-2">
              <Settings className="h-4.5 w-4.5 text-amber-500" />
              <span>Import Settings & Markup</span>
            </h3>

            {/* Supplier / Brand Category defaults */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-neutral-500 uppercase">Global Supplier Sourced</label>
                <input 
                  type="text" 
                  className="w-full bg-white px-3 py-1.5 border border-neutral-250 rounded-lg font-semibold"
                  value={globalSupplier}
                  onChange={e => setGlobalSupplier(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-neutral-500 uppercase">Override Brand (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Applies brand tag if missing in file"
                  className="w-full bg-white px-3 py-1.5 border border-neutral-250 rounded-lg"
                  value={globalBrand}
                  onChange={e => setGlobalBrand(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-neutral-500 uppercase">Default Category Override</label>
                <select 
                  className="w-full bg-white px-3 py-1.5 border border-neutral-250 rounded-lg font-semibold"
                  value={globalCategory}
                  onChange={e => setGlobalCategory(e.target.value)}
                >
                  <option value="">Keep file category</option>
                  <option value="dresses">Dresses</option>
                  <option value="abayas">Abayas</option>
                  <option value="handbags">Handbags</option>
                  <option value="shoes">Shoes</option>
                  <option value="beauty">Beauty</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="watches">Watches</option>
                </select>
              </div>
            </div>            {/* Currency conversion, Markup Percentages (Step 7) */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/50 space-y-4">
              <h4 className="text-[10px] font-black uppercase text-neutral-700 tracking-wider flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                <span>Centralized Pricing Engine Parameters</span>
              </h4>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-neutral-500 uppercase">File Supplier Currency</label>
                  <select 
                    className="w-full bg-white px-2.5 py-1.5 border border-neutral-250 rounded-lg text-xs font-bold text-emerald-800"
                    value={importCurrency}
                    onChange={e => setImportCurrency(e.target.value)}
                  >
                    <option value="AED">Dubai (AED) — Rate: {pricingSettings?.exchangeRates?.AED || 31} ETB</option>
                    <option value="USD">USA (USD) — Rate: {pricingSettings?.exchangeRates?.USD || 115} ETB</option>
                  </select>
                  <span className="text-[8.5px] text-neutral-400 font-semibold block">Select which currency the imported file's prices represent.</span>
                </div>

                <div className="border-t border-dashed border-neutral-200 pt-2.5 space-y-1.5 text-[10.5px] font-semibold text-neutral-600">
                  <div className="flex justify-between">
                    <span>Int'l Shipping:</span>
                    <span className="font-mono text-neutral-800">{pricingSettings?.shippingPercentage || 20}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling Fee:</span>
                    <span className="font-mono text-neutral-800">{pricingSettings?.handlingPercentage || 5}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Buffer:</span>
                    <span className="font-mono text-neutral-800">{pricingSettings?.riskBufferPercentage || 3}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Profit:</span>
                    <span className="font-mono text-neutral-800">{pricingSettings?.profitPercentage || 15}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fixed Fee:</span>
                    <span className="font-mono text-neutral-800">{pricingSettings?.fixedFeeETB || 0} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rounding:</span>
                    <span className="font-mono text-amber-600 font-bold">{pricingSettings?.roundingRule || 'None'}</span>
                  </div>
                </div>
              </div>

              <div className="text-[10.5px] text-neutral-500 bg-white p-2.5 rounded-lg border border-neutral-200/45 leading-relaxed font-semibold">
                <span className="text-neutral-700 block font-bold mb-0.5">Live Converter Preview:</span>
                Row Price = 100 {importCurrency} <br/>
                AddisDubai Selling Price = <span className="font-mono text-emerald-700 font-black">
                  {calculateSellingPrice(100, importCurrency, pricingSettings).roundedTotalETB.toLocaleString()} {currency}
                </span>
              </div>
            </div>

            {/* Duplicate Sourcing Actions (Step 8) */}
            <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200/50">
              <h4 className="text-[10px] font-black uppercase text-neutral-700 tracking-wider flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span>Duplicate Control Engine</span>
              </h4>

              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-neutral-500 uppercase">Detect duplication by:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="dupCheck" 
                        checked={dupCheckField === 'sku'} 
                        onChange={() => setDupCheckField('sku')} 
                        className="h-3.5 w-3.5"
                      />
                      <span>SKU</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="dupCheck" 
                        checked={dupCheckField === 'name'} 
                        onChange={() => setDupCheckField('name')} 
                        className="h-3.5 w-3.5"
                      />
                      <span>Product Name</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-neutral-500 uppercase">If duplication occurs:</label>
                  <select 
                    className="w-full bg-white px-2.5 py-1.5 border border-neutral-250 rounded-lg text-xs"
                    value={dupStrategy}
                    onChange={e => setDupStrategy(e.target.value as any)}
                  >
                    <option value="skip">Skip Sourced Duplicates</option>
                    <option value="update">Overwrite & Update Catalog</option>
                    <option value="copy">Force Save (Create New Copy)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Import Status default settings */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-neutral-500 uppercase">Import Sourced Status</label>
              <select
                className="w-full bg-white px-3 py-1.5 border border-neutral-250 rounded-lg font-semibold text-xs"
                value={globalImportStatus}
                onChange={e => setGlobalImportStatus(e.target.value as any)}
              >
                <option value="Draft">Draft (Safest - review first)</option>
                <option value="Published">Published (Push Live instantly)</option>
              </select>
            </div>

          </div>
        </div>
      )}

      {/* 3. PREVIEW & STAGING SCREEN (Step 6) */}
      {activeStep === 'PREVIEW' && (
        <div className="space-y-6">
          
          {/* Top Validation Statistics Filters Card */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button 
              onClick={() => setFilterValidation('all')}
              className={`p-4 rounded-xl border text-left transition-all ${
                filterValidation === 'all' ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <span className="text-[9.5px] font-extrabold uppercase text-neutral-400 block tracking-wider">Total Rows</span>
              <span className="text-xl font-mono font-black">{previewStats.total}</span>
            </button>

            <button 
              onClick={() => setFilterValidation('valid')}
              className={`p-4 rounded-xl border text-left transition-all ${
                filterValidation === 'valid' ? 'bg-emerald-800 text-white border-emerald-800 shadow-md' : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <span className="text-[9.5px] font-extrabold uppercase text-emerald-400 block tracking-wider">Valid Rows</span>
              <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-300">{previewStats.valid}</span>
            </button>

            <button 
              onClick={() => setFilterValidation('warning')}
              className={`p-4 rounded-xl border text-left transition-all ${
                filterValidation === 'warning' ? 'bg-amber-700 text-white border-amber-700 shadow-md' : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <span className="text-[9.5px] font-extrabold uppercase text-amber-300 block tracking-wider">Warnings</span>
              <span className="text-xl font-mono font-black text-amber-500">{previewStats.warning}</span>
            </button>

            <button 
              onClick={() => setFilterValidation('error')}
              className={`p-4 rounded-xl border text-left transition-all ${
                filterValidation === 'error' ? 'bg-rose-900 text-white border-rose-900 shadow-md' : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <span className="text-[9.5px] font-extrabold uppercase text-rose-300 block tracking-wider">Errors</span>
              <span className="text-xl font-mono font-black text-rose-600">{previewStats.error}</span>
            </button>

            <div className="bg-neutral-900 text-white p-4 rounded-xl border border-neutral-800 flex flex-col justify-center">
              <span className="text-[9.5px] font-extrabold uppercase text-amber-400 tracking-wider">Selected Rows</span>
              <span className="text-xl font-mono font-black">{previewStats.selected} / {previewStats.total}</span>
            </div>
          </div>

          {/* Table Staging Action Toolbar */}
          <div className="bg-white p-4 border border-neutral-200/70 shadow-sm rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={previewSearch}
                onChange={e => setPreviewSearch(e.target.value)}
                placeholder="Search staging list by name, SKU, brand..."
                className="w-full bg-white h-10 pl-10 pr-4 text-xs border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-semibold"
              />
            </div>

            {/* Quick Batch adjustments */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="text-neutral-400 text-[10px] uppercase font-bold">Import Batch Size:</span>
                <select
                  className="bg-neutral-50 border rounded px-2 py-1 font-mono font-bold"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value) || 50)}
                >
                  <option value="10">10 (Careful)</option>
                  <option value="50">50 (Default)</option>
                  <option value="100">100 (Standard)</option>
                  <option value="500">500 (Aggressive)</option>
                </select>
              </div>

              {/* Action Button */}
              <button
                onClick={handleLaunchImport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider py-2.5 px-5 rounded-lg transition-all flex items-center gap-2 shadow"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Launch Import Engine</span>
              </button>
            </div>
          </div>

          {/* Interactive Editable Staging Grid (Step 6) */}
          <div className="bg-white rounded-xl border border-neutral-200/70 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans whitespace-nowrap">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-black uppercase text-[9px] select-none">
                    <th className="py-3 px-4 w-10 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-neutral-300 text-neutral-950 h-4 w-4 cursor-pointer"
                        checked={selectedStagedSkus.length === stagedProducts.length && stagedProducts.length > 0}
                        onChange={(e) => handleSelectAllStaged(e.target.checked)}
                      />
                    </th>
                    <th className="py-3 px-3">Product Specifications</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Brand Label</th>
                    <th className="py-3 px-3 font-mono text-right">Supplier Price</th>
                    <th className="py-3 px-3 font-mono text-right">Selling Price (ETB)</th>
                    <th className="py-3 px-3 font-mono">Stock</th>
                    <th className="py-3 px-3 text-center">Validation</th>
                    <th className="py-3 px-3 text-center">Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredStagedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-10 text-neutral-400">
                        <HelpCircle className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
                        <span className="font-bold">No staged products match current filters.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredStagedProducts.map((item) => (
                      <React.Fragment key={item.id}>
                        <tr 
                          className={`hover:bg-neutral-50/50 transition-colors ${
                            item.validation.status === 'error' ? 'bg-rose-50/20' : 
                            item.validation.status === 'warning' ? 'bg-amber-50/10' : ''
                          }`}
                        >
                          <td className="py-2.5 px-4 text-center">
                            <input 
                              type="checkbox" 
                              className="rounded border-neutral-300 text-neutral-950 h-4 w-4 cursor-pointer"
                              checked={selectedStagedSkus.includes(item.sku)}
                              onChange={(e) => handleSelectItem(item.sku, e.target.checked)}
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={item.images?.[0] || 'https://placehold.co/40'} 
                                className="h-10 w-8 object-cover border rounded shrink-0 shadow-sm bg-neutral-100" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="space-y-0.5">
                                <input 
                                  type="text"
                                  className="font-extrabold text-neutral-900 border-b border-transparent hover:border-neutral-300 focus:border-black focus:outline-none bg-transparent w-64 px-1 py-0.5"
                                  value={item.name}
                                  onChange={(e) => handleInlineEdit(item.id, 'name', e.target.value)}
                                />
                                <input 
                                  type="text"
                                  className="text-[10px] text-neutral-400 hover:border-neutral-300 focus:border-black focus:outline-none bg-transparent w-64 block px-1 truncate"
                                  value={item.description}
                                  onChange={(e) => handleInlineEdit(item.id, 'description', e.target.value)}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            <input 
                              type="text"
                              className="font-mono text-[10.5px] font-bold text-neutral-500 border-b border-transparent hover:border-neutral-300 focus:border-black focus:outline-none bg-transparent w-28"
                              value={item.sku}
                              onChange={(e) => handleInlineEdit(item.id, 'sku', e.target.value)}
                            />
                          </td>

                          <td className="py-2.5 px-3">
                            <select
                              className="text-xs bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-black focus:outline-none font-bold"
                              value={item.category}
                              onChange={(e) => handleInlineEdit(item.id, 'category', e.target.value)}
                            >
                              <option value="dresses">Dresses</option>
                              <option value="abayas">Abayas</option>
                              <option value="handbags">Handbags</option>
                              <option value="shoes">Shoes</option>
                              <option value="beauty">Beauty</option>
                              <option value="jewelry">Jewelry</option>
                              <option value="watches">Watches</option>
                            </select>
                          </td>

                          <td className="py-2.5 px-3">
                            <input 
                              type="text"
                              className="font-semibold text-neutral-600 border-b border-transparent hover:border-neutral-300 focus:border-black focus:outline-none bg-transparent w-24"
                              value={item.brand}
                              onChange={(e) => handleInlineEdit(item.id, 'brand', e.target.value)}
                            />
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-600">
                            {item.supplierPrice?.toFixed(2)} {item.supplierCurrency || importCurrency}
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1 font-mono">
                              <input 
                                type="number"
                                className={`w-16 text-right font-black bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-black focus:outline-none text-[11px] ${
                                  item.isOverridden ? 'text-amber-700 underline decoration-dashed' : 'text-emerald-800'
                                }`}
                                value={item.priceETB}
                                onChange={(e) => handleInlineEdit(item.id, 'priceETB', parseInt(e.target.value) || 0)}
                              />
                              <span className="text-[10px] text-neutral-400 font-bold">{currency}</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 font-mono">
                            <input 
                              type="number"
                              className="w-10 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-black focus:outline-none text-neutral-600 text-center font-bold"
                              value={item.quantityAvailable}
                              onChange={(e) => handleInlineEdit(item.id, 'quantityAvailable', parseInt(e.target.value) || 0)}
                            />
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            {item.validation.status === 'valid' && (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[9px] font-black uppercase">
                                <CheckCircle className="h-3 w-3" />
                                <span>Valid</span>
                              </span>
                            )}
                            {item.validation.status === 'warning' && (
                              <span 
                                className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-[9px] font-black uppercase cursor-help"
                                title={item.validation.messages.join(' \n')}
                              >
                                <AlertTriangle className="h-3 w-3" />
                                <span>Warning</span>
                              </span>
                            )}
                            {item.validation.status === 'error' && (
                              <span 
                                className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 px-2.5 py-1 rounded-full text-[9px] font-black uppercase cursor-help"
                                title={item.validation.messages.join(' \n')}
                              >
                                <XCircle className="h-3 w-3" />
                                <span>Error</span>
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleRowExpand(item.sku)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>{expandedRowSkus[item.sku] ? 'Hide' : 'View'}</span>
                            </button>
                          </td>
                        </tr>

                        {expandedRowSkus[item.sku] && (
                          <tr className="bg-neutral-50/70 border-b border-neutral-200">
                            <td colSpan={10} className="p-4">
                              <div className="bg-white p-4 border border-neutral-250 rounded-xl space-y-4 max-w-2xl text-[11px] leading-relaxed shadow-inner">
                                <div className="flex items-center justify-between border-b pb-2">
                                  <h4 className="font-extrabold text-neutral-800 flex items-center gap-1.5 uppercase tracking-wide">
                                    <Sparkles className="h-4 w-4 text-emerald-600" />
                                    <span>Pricing Engine Cost Breakdown ({item.sku})</span>
                                  </h4>
                                  {item.isOverridden && (
                                    <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1">
                                      <AlertTriangle className="h-2.5 w-2.5" />
                                      <span>Manual Override Active</span>
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-medium text-neutral-600">
                                  <div className="flex justify-between border-b border-dashed pb-1">
                                    <span>Supplier Cost:</span>
                                    <span className="font-bold text-neutral-900">{item.supplierPrice?.toFixed(2)} {item.supplierCurrency || importCurrency}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-dashed pb-1">
                                    <span>Exchange Rate:</span>
                                    <span className="font-mono text-neutral-900">{(item.exchangeRateUsed || pricingSettings?.exchangeRates?.[item.supplierCurrency || importCurrency] || 1).toFixed(2)} ETB</span>
                                  </div>
                                  <div className="flex justify-between border-b border-dashed pb-1">
                                    <span>Base Cost (ETB):</span>
                                    <span className="font-mono text-neutral-900">{(item.supplierPrice * (item.exchangeRateUsed || pricingSettings?.exchangeRates?.[item.supplierCurrency || importCurrency] || 1)).toFixed(2)} ETB</span>
                                  </div>
                                  <div className="flex justify-between border-b border-dashed pb-1">
                                    <span>Int'l Shipping ({item.shippingPercentageUsed || pricingSettings?.shippingPercentage || 0}%):</span>
                                    <span className="font-mono text-neutral-900">
                                      {(((item.supplierPrice * (item.exchangeRateUsed || pricingSettings?.exchangeRates?.[item.supplierCurrency || importCurrency] || 1)) * (item.shippingPercentageUsed || pricingSettings?.shippingPercentage || 0)) / 100).toFixed(2)} ETB
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-b border-dashed pb-1">
                                    <span>Handling Fee ({item.handlingPercentageUsed || pricingSettings?.handlingPercentage || 0}%):</span>
                                    <span className="font-mono text-neutral-900">
                                      {(((item.supplierPrice * (item.exchangeRateUsed || pricingSettings?.exchangeRates?.[item.supplierCurrency || importCurrency] || 1)) * (item.handlingPercentageUsed || pricingSettings?.handlingPercentage || 0)) / 100).toFixed(2)} ETB
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-b border-dashed pb-1">
                                    <span>Risk Buffer ({item.riskBufferPercentageUsed || pricingSettings?.riskBufferPercentage || 0}%):</span>
                                    <span className="font-mono text-neutral-900">
                                      {(((item.supplierPrice * (item.exchangeRateUsed || pricingSettings?.exchangeRates?.[item.supplierCurrency || importCurrency] || 1)) * (item.riskBufferPercentageUsed || pricingSettings?.riskBufferPercentage || 0)) / 100).toFixed(2)} ETB
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-b border-dashed pb-1">
                                    <span>Fixed ETB Fee:</span>
                                    <span className="font-mono text-neutral-900">{(item.fixedFeeUsed || 0).toFixed(2)} ETB</span>
                                  </div>
                                  <div className="flex justify-between border-b border-dashed pb-1">
                                    <span>Subtotal Cost (ETB):</span>
                                    <span className="font-mono font-bold text-neutral-900">
                                      {(item.pricingBreakdown?.subtotalCostETB || 0).toFixed(2)} ETB
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-b border-dashed pb-1">
                                    <span>Profit Margin ({item.profitPercentageUsed || pricingSettings?.profitPercentage || 0}%):</span>
                                    <span className="font-mono text-emerald-700">
                                      +{(item.pricingBreakdown?.profitCostETB || 0).toFixed(2)} ETB
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-b border-dashed pb-1">
                                    <span>Unrounded Rec:</span>
                                    <span className="font-mono text-neutral-900">{(item.pricingBreakdown?.calculatedSellingPriceETB || 0).toFixed(2)} ETB</span>
                                  </div>
                                  <div className="flex justify-between border-b border-dashed pb-1">
                                    <span>Rounding ({pricingSettings?.roundingRule || 'None'}):</span>
                                    <span className="font-bold text-amber-700">{item.calculatedSellingPriceETB || item.priceETB} ETB</span>
                                  </div>
                                  <div className="flex justify-between border-b border-dashed pb-1">
                                    <span>Gross Profit (ETB):</span>
                                    <span className="font-mono font-bold text-emerald-700">
                                      {(item.priceETB - (item.pricingBreakdown?.subtotalCostETB || 0)).toFixed(2)} ETB
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between bg-neutral-50 p-2.5 rounded-lg border text-xs">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <span className="text-[10px] text-neutral-400 font-bold block uppercase">Calculated Price</span>
                                      <span className="font-extrabold text-neutral-700">{item.calculatedSellingPriceETB || item.priceETB} ETB</span>
                                    </div>
                                    <div className="border-l h-8 pl-4">
                                      <span className="text-[10px] text-neutral-400 font-bold block uppercase">Active Price</span>
                                      <span className="font-black text-emerald-800">{item.priceETB} ETB</span>
                                    </div>
                                    <div className="border-l h-8 pl-4">
                                      <span className="text-[10px] text-neutral-400 font-bold block uppercase">Gross Margin %</span>
                                      <span className={`font-black ${item.priceETB - (item.pricingBreakdown?.subtotalCostETB || 0) > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {item.priceETB > 0 ? (((item.priceETB - (item.pricingBreakdown?.subtotalCostETB || 0)) / item.priceETB) * 100).toFixed(1) : '0.0'}%
                                      </span>
                                    </div>
                                  </div>

                                  {item.isOverridden && (
                                    <button
                                      type="button"
                                      className="px-2.5 py-1 text-[10px] bg-neutral-200 hover:bg-neutral-300 rounded font-black text-neutral-800 uppercase transition-colors"
                                      onClick={() => {
                                        setStagedProducts(prev => prev.map(p => {
                                          if (p.id === item.id) {
                                            return {
                                              ...p,
                                              priceETB: p.calculatedSellingPriceETB || p.priceETB,
                                              isOverridden: false
                                            };
                                          }
                                          return p;
                                        }));
                                      }}
                                    >
                                      Reset Override
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACTIVE IMPORTING ENGINE (Step 9) */}
      {activeStep === 'IMPORTING' && (
        <div className="bg-white p-6 border border-neutral-200/70 shadow-sm rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase text-neutral-900 flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                <span>Bulk Import Engine Active</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Processing, converting prices, and caching catalog parameters in chunks safely.
              </p>
            </div>
            
            <button
              onClick={() => setCancelRequested(true)}
              disabled={cancelRequested}
              className="bg-neutral-100 hover:bg-rose-50 text-neutral-600 hover:text-rose-700 font-extrabold text-[10px] uppercase tracking-wider py-2 px-4 rounded-lg border border-neutral-200 transition-colors"
            >
              {cancelRequested ? 'Cancel Pending...' : 'Cancel Import'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-neutral-500 font-black uppercase tracking-wider">Overall Import Progress</span>
              <span className="font-mono text-sm font-black text-amber-600">{importProgress}%</span>
            </div>
            
            <div className="h-3.5 w-full bg-neutral-100 rounded-full overflow-hidden border">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>

          {/* Scrolling Terminal Output Logs */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Runtime Console Output</h4>
            <div className="bg-neutral-950 text-neutral-200 p-4 rounded-xl font-mono text-[10px] space-y-1 max-h-[300px] overflow-y-auto leading-relaxed border border-neutral-900 shadow-inner">
              {importLogs.map((log, index) => (
                <div key={index} className={
                  log.includes('[ERROR]') ? 'text-rose-400 font-bold' : 
                  log.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' : 
                  log.includes('[WARN]') ? 'text-amber-400 font-bold' : 'text-neutral-300'
                }>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. IMPORT REPORT SUMMARY (Step 10) */}
      {activeStep === 'REPORT' && (
        <div className="bg-white p-6 border border-neutral-200/70 shadow-sm rounded-xl space-y-6">
          <div className="text-center max-w-md mx-auto space-y-2 select-none py-4">
            <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-base font-black text-neutral-900 uppercase tracking-tight">Product Import Complete</h3>
            <p className="text-xs text-neutral-500">
              The bulk transactional sequence has finished processing. Staged items have been imported safely.
            </p>
          </div>

          {/* Sourced counts bento grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 py-2 text-center">
            <div className="p-4 bg-neutral-50 rounded-xl border">
              <span className="text-[9.5px] font-extrabold uppercase text-neutral-400 block tracking-wider">Found</span>
              <span className="text-lg font-mono font-black text-neutral-900">{importReport.total}</span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[9.5px] font-extrabold uppercase text-emerald-600 block tracking-wider">Imported</span>
              <span className="text-lg font-mono font-black text-emerald-700">{importReport.imported}</span>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-[9.5px] font-extrabold uppercase text-blue-600 block tracking-wider">Updated</span>
              <span className="text-lg font-mono font-black text-blue-700">{importReport.updated}</span>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[9.5px] font-extrabold uppercase text-amber-600 block tracking-wider">Skipped</span>
              <span className="text-lg font-mono font-black text-amber-700">{importReport.skipped}</span>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[9.5px] font-extrabold uppercase text-rose-600 block tracking-wider">Failed</span>
              <span className="text-lg font-mono font-black text-rose-700">{importReport.failed}</span>
            </div>
            <div className="p-4 bg-neutral-900 text-white rounded-xl">
              <span className="text-[9.5px] font-extrabold uppercase text-neutral-400 block tracking-wider">Duration</span>
              <span className="text-xs font-mono font-black block mt-2">{(importReport.duration / 1000).toFixed(1)}s</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-5">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadErrorReport}
                className="px-4 py-2 bg-neutral-50 hover:bg-neutral-100 border rounded-lg text-xs font-extrabold text-neutral-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Error Report</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setParsedRawData([]);
                  setStagedProducts([]);
                  setActiveStep('UPLOAD');
                }}
                className="w-full sm:w-auto px-5 py-2.5 border rounded-lg text-xs font-black uppercase tracking-wider hover:bg-neutral-50 transition-colors text-center"
              >
                Import Another File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. HISTORY LOG DIRECTORY (Step 11) */}
      {activeStep === 'HISTORY' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left History Jobs Table */}
          <div className="xl:col-span-2 bg-white p-5 border border-neutral-200/70 shadow-sm rounded-xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase text-neutral-900 flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-neutral-500" />
                <span>Import Sourced History logs</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Review previous spreadsheet catalog sourcing operations and statuses.
              </p>
            </div>

            {loadingHistory ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : historyJobs.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center text-neutral-400">
                <History className="h-8 w-8 mb-2" />
                <span className="font-bold text-xs">No import records logged yet.</span>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-neutral-200/50">
                <table className="w-full text-left text-xs font-sans whitespace-nowrap">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-black uppercase text-[9px] select-none">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Supplier Sourced</th>
                      <th className="py-2.5 px-3">Filename</th>
                      <th className="py-2.5 px-3 font-mono text-center">Products Sourced</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {historyJobs.map((job) => (
                      <tr 
                        key={job.id} 
                        className={`hover:bg-neutral-50/50 transition-colors cursor-pointer ${selectedHistoryJob?.id === job.id ? 'bg-neutral-50' : ''}`}
                        onClick={() => handleViewHistoryReport(job)}
                      >
                        <td className="py-2.5 px-3 font-semibold text-neutral-900">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-neutral-700 capitalize">{job.supplier}</td>
                        <td className="py-2.5 px-3 text-neutral-500 truncate max-w-[140px]" title={job.filename}>
                          {job.filename}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-center font-bold">{job.totalRows || 0}</td>
                        <td className="py-2.5 px-3 text-center">
                          {job.status === 'Completed' ? (
                            <span className="bg-emerald-50 text-emerald-800 text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase">Success</span>
                          ) : (
                            <span className="bg-rose-50 text-rose-800 text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase">Failed</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleViewHistoryReport(job)}
                              className="p-1 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded"
                              title="View report summary"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteHistoryLog(job.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded"
                              title="Delete log record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right History items drill down panel */}
          <div className="bg-white p-5 border border-neutral-200/70 shadow-sm rounded-xl space-y-4 h-fit">
            <h3 className="text-xs font-black uppercase text-neutral-900 border-b pb-2 flex items-center justify-between">
              <span>Selected Job Details</span>
              {selectedHistoryJob && (
                <span className="text-[10px] text-neutral-400 font-mono">Job #{selectedHistoryJob.id}</span>
              )}
            </h3>

            {selectedHistoryJob ? (
              <div className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-3 rounded-lg text-[11px]">
                  <div>
                    <span className="text-neutral-400 uppercase font-bold text-[8px] block">Duration Sourced</span>
                    <span className="font-mono font-bold">{(selectedHistoryJob.duration / 1000).toFixed(2)}s</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 uppercase font-bold text-[8px] block">Success rate</span>
                    <span className="font-mono font-extrabold text-emerald-700">
                      {selectedHistoryJob.totalRows > 0 ? Math.round((selectedHistoryJob.importedCount / selectedHistoryJob.totalRows) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block">Processed Catalog List ({selectedHistoryJobItems.length})</span>
                  <div className="max-h-[260px] overflow-y-auto space-y-1.5 border border-neutral-100 rounded-lg p-2">
                    {selectedHistoryJobItems.length === 0 ? (
                      <span className="text-[10px] text-neutral-400 italic block text-center py-4">No detail records logged.</span>
                    ) : (
                      selectedHistoryJobItems.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-1.5 hover:bg-neutral-50 rounded text-[11px]">
                          <div className="truncate max-w-[160px]">
                            <span className="font-extrabold text-neutral-900 block truncate">{item.name}</span>
                            <span className="font-mono text-[9px] text-neutral-400 font-bold">{item.sku}</span>
                          </div>
                          
                          {item.status === 'Imported' ? (
                            <span className="text-emerald-700 font-black text-[9px] uppercase">Succeeded</span>
                          ) : (
                            <span className="text-rose-700 font-black text-[9px] uppercase" title={item.errorMessage}>Failed</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {selectedHistoryJob.errorLog && (
                  <div className="space-y-1 text-[10px]">
                    <span className="text-neutral-400 uppercase font-bold block">Console error output</span>
                    <pre className="bg-neutral-950 text-rose-400 p-2 rounded max-h-[100px] overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed">
                      {selectedHistoryJob.errorLog}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-400 select-none">
                <Eye className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                <span className="text-xs font-bold">Select an import job from the table to view the detailed specification report.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Inline Supplier Creation Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">Add New Supplier</h4>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Supplier Name</label>
              <input
                type="text"
                className="w-full bg-white border border-neutral-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-black"
                placeholder="e.g. Trendyol"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddSupplierModal(false);
                  setNewSupplierName('');
                }}
                className="px-4 py-2 hover:bg-neutral-100 rounded-lg text-neutral-500 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSupplier}
                className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg font-black uppercase tracking-wider"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Brand Creation Modal */}
      {showAddBrandModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">Add New Brand</h4>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Brand Name</label>
              <input
                type="text"
                className="w-full bg-white border border-neutral-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-black"
                placeholder="e.g. Zara"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddBrandModal(false);
                  setNewBrandName('');
                }}
                className="px-4 py-2 hover:bg-neutral-100 rounded-lg text-neutral-500 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddBrand}
                className="px-4 py-2 bg-neutral-900 text-white hover:bg-amber-500 hover:text-black rounded-lg font-black uppercase tracking-wider"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
