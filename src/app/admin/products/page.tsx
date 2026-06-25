'use client';

import React, { useEffect, useState } from 'react';
import { 
  getAllProducts,
  updateProductStock, 
  addProduct,
  deleteProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  deleteAllProducts,
  syncVerifiedCatalog
} from '@/lib/admin';
import { uploadProductMedia } from '@/lib/storage';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
  RotateCcw,
  Ban,
  Image as ImageIcon,
  Loader2,
  X,
  Upload,
  Check,
  LayoutGrid,
  List,
  RefreshCw,
  FileSpreadsheet,
  Star
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { VERIFIED_INVENTORY } from '@/lib/constants';
import { normalizeWeightOptions, type WeightOption } from '@/lib/pricing';

function ProductsContent() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, removed
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [inlineEditingPrice, setInlineEditingPrice] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsBulkLoading(true);
    const loadingToast = toast.loading('Parsing inventory file...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        toast.loading(`Uploading ${data.length} products...`, { id: loadingToast });

        let addedCount = 0;
        for (const item of data) {
          // Normalize data
          const name = item.Name || item.name || '';
          if (!name) continue;

          let category = item.Category || item.category || 'Vegetables';
          let category_slug = 'vegetables';

          if (category.toLowerCase().includes('fruit')) {
            category = 'Fruits';
            category_slug = 'fruits';
          } else if (category.toLowerCase().includes('valluvam') || category.toLowerCase().includes('trad')) {
            category = 'Valluvam Products';
            category_slug = 'trad';
          }

          const dbProduct = {
            name,
            description: item.Description || item.description || '',
            price: parseFloat(item.Price || item.price || '0'),
            mrp: parseFloat(item.Price || item.price || '0'),
            unit: item.Unit || item.unit || 'kg',
            stock: parseInt(item.Stock || item.stock || '100'),
            is_featured: !!(item.Seasonal || item.is_seasonal),
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category,
            category_slug,
            image_url: item.Image || item.image_url || '/placeholder_product.webp',
            image_urls: [item.Image || item.image_url || '/placeholder_product.webp'],
            in_stock: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error } = await addProduct(dbProduct);
          if (!error) addedCount++;
        }

        toast.success(`Bulk upload complete! Added ${addedCount} products.`, { id: loadingToast });
        // eslint-disable-next-line react-hooks/immutability
        fetchProducts(); // Refresh list
      } catch (err) {
        console.error('Bulk upload error:', err);
        toast.error('Failed to process file', { id: loadingToast });
      } finally {
        setIsBulkLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSelectionDrawer, setShowSelectionDrawer] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Vegetables',
    price: '',
    description: '',
    unit: 'kg',
    image_url: '',
    video_url: '',
    order_index: 0,
    stock: 100,
    is_seasonal: false,
    image_urls: [''],
    // Customer quantity options: 'fixed' = only the listed weights are
    // selectable, each optionally with its own special offer price;
    // 'range' = customer can pick any value between min/max (linear price).
    weight_mode: 'fixed' as 'fixed' | 'range',
    weight_options: [
      { weight: 1, price: null },
      { weight: 2, price: null },
      { weight: 5, price: null },
      { weight: 10, price: null }
    ] as WeightOption[],
    weight_min: 1,
    weight_max: 10,
    weight_step: 1
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'Vegetables',
    price: '',
    description: '',
    unit: 'kg',
    image_url: '',
    video_url: '',
    order_index: 0,
    stock: 100,
    is_seasonal: false,
    image_urls: [''],
    weight_mode: 'fixed' as 'fixed' | 'range',
    weight_options: [
      { weight: 1, price: null },
      { weight: 2, price: null },
      { weight: 5, price: null },
      { weight: 10, price: null }
    ] as WeightOption[],
    weight_min: 1,
    weight_max: 10,
    weight_step: 1
  });

  const [customWeightInput, setCustomWeightInput] = useState('');

  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  useEffect(() => {
    fetchProducts();
    if (initialSearch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await getAllProducts();
    if (error) {
      console.error('Error fetching products:', error);
      toast.error(`Could not load products: ${error.message || JSON.stringify(error)}`);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  async function handleAddSamples() {
    setIsBulkLoading(true);
    const samples = VERIFIED_INVENTORY;

    try {
      const result = await syncVerifiedCatalog(samples);
      if (result.success) {
        toast.success(`Catalog synced! Added ${result.added}, Updated ${result.updated}, Removed ${result.removed}`);
        fetchProducts();
      } else {
        toast.error('Sync failed');
      }
    } catch (err) {
      toast.error('Failed to add samples');
    } finally {
      setIsBulkLoading(false);
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel('admin_products_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProducts(prev => {
            // Prevent duplicates from race conditions with fetchProducts
            if (prev.some(p => p.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function toggleStock(productId: string, inStock: boolean) {
    const { error } = await updateProductStock(productId, inStock);
    if (!error) {
      toast.success(inStock ? 'Product marked as In Stock' : 'Product marked as Out of Stock');
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: inStock ? 100 : 0 } : p));
    } else {
      toast.error('Failed to update stock status');
    }
  }

  // Toggle whether a product appears in the "Freshly Harvested" section on the homepage.
  async function toggleFeatured(productId: string, featured: boolean) {
    const { error } = await updateProduct(productId, { is_featured: featured });
    if (!error) {
      toast.success(featured ? 'Added to Freshly Harvested' : 'Removed from Freshly Harvested');
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_featured: featured } : p));
    } else {
      toast.error('Failed to update featured status');
    }
  }

  async function handleSoftDelete(productId: string) {
    const { error } = await softDeleteProduct(productId);
    if (!error) {
      toast.success('Product removed from website');
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_active: false } : p));
    } else {
      toast.error('Failed to remove product');
    }
  }

  async function handleRestore(productId: string) {
    const { error } = await restoreProduct(productId);
    if (!error) {
      toast.success('Product restored to website');
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_active: true } : p));
    } else {
      toast.error('Failed to restore product');
    }
  }

  async function handleHardReset() {
    if (!confirm('CRITICAL: This will PERMANENTLY WIPE your current database and re-sync with the 44 verified items from your public folder. This cannot be undone. Proceed?')) return;
    
    setIsBulkLoading(true);
    const loadingToast = toast.loading('Initializing deep reset...');
    
    try {
      // 1. Clear ALL relevant local storage cache (very aggressive)
      if (typeof window !== 'undefined') {
        toast.loading('Clearing local browser cache...', { id: loadingToast });
        const keysToRemove = [
          'farmers_factory_products',
          'farmers_factory_cart',
          'farmers_factory_guest_cart',
          'farmers_factory_session',
          'farmers_factory_order_items',
          'farmers_factory_wishlist',
          'farmers_factory_profiles'
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        window.dispatchEvent(new Event('storage'));
      }

      // 2. Perform robust bulk sync (Wipe + Re-insert)
      toast.loading('Wiping database and re-seeding verified catalog...', { id: loadingToast });
      const result = await syncVerifiedCatalog(VERIFIED_INVENTORY);
      
      if (result.success) {
        toast.success(`Success! ${result.added} verified products are now live.`, { id: loadingToast, duration: 4000 });
        // Refresh after a delay so they see the success
        setTimeout(() => {
          window.location.href = '/admin/products'; // Force hard reload to this page
        }, 2000);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorMsg = (result.error as any)?.message || 'Sync failed';
        console.error('Reset error details:', result.error);
        toast.error(`Reset failed: ${errorMsg}. Try clearing cache manually.`, { id: loadingToast });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Reset failed:', error);
      toast.error(`Reset failed: ${error.message || 'Unknown error'}`, { id: loadingToast });
    } finally {
      setIsBulkLoading(false);
    }
  }

  function handleClearCache() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('farmers_factory_products');
      localStorage.removeItem('farmers_factory_session');
      localStorage.removeItem('farmers_factory_profiles');
      window.location.reload();
    }
  }

  async function handleInlinePriceUpdate(productId: string) {
    const price = parseFloat(newPrice);
    if (isNaN(price)) return;

    const { error } = await updateProduct(productId, { price });
    if (!error) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, price } : p));
      setInlineEditingPrice(null);
    }
  }

  async function handleBulkAction(action: 'in_stock' | 'out_stock' | 'archive' | 'restore') {
    if (selectedProducts.length === 0) return;
    setIsBulkLoading(true);
    
    try {
      const updates = selectedProducts.map(async (id) => {
        if (action === 'in_stock') return updateProductStock(id, true);
        if (action === 'out_stock') return updateProductStock(id, false);
        if (action === 'archive') return softDeleteProduct(id);
        if (action === 'restore') return restoreProduct(id);
      });

      await Promise.all(updates);
      
      // Refresh products or update state locally
      setProducts(prev => prev.map(p => {
        if (selectedProducts.includes(p.id)) {
          if (action === 'in_stock') return { ...p, stock: 100 };
          if (action === 'out_stock') return { ...p, stock: 0 };
          if (action === 'archive') return { ...p, is_active: false };
          if (action === 'restore') return { ...p, is_active: true };
        }
        return p;
      }));
      
      setSelectedProducts([]);
    } catch (err) {
      console.error('Bulk action failed:', err);
    } finally {
      setIsBulkLoading(false);
    }
  }

  function toggleSelectAll() {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSelectedProducts(filteredProducts.map((p: any) => p.id));
    }
  }

  function toggleSelectProduct(id: string) {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function openEditModal(product: any) {
    setEditingProduct(product);
    setEditFormData({
      name: product.name || '',
      category: product.category || 'Vegetables',
      price: (product.price || 0).toString(),
      description: product.description || '',
      unit: product.unit || 'kg',
      image_url: product.image_url || '',
      video_url: product.video_url || '',
      order_index: product.order_index || 0,
      stock: product.stock || 0,
      is_seasonal: product.is_seasonal || false,
      image_urls: Array.isArray(product.image_urls) && product.image_urls.length > 0 ? product.image_urls : [product.image_url || ''],
      weight_mode: product.weight_mode === 'range' ? 'range' : 'fixed',
      weight_options: (() => {
        const opts = normalizeWeightOptions(product.weight_options);
        return opts.length > 0 ? opts : [
          { weight: 1, price: null },
          { weight: 2, price: null },
          { weight: 5, price: null },
          { weight: 10, price: null }
        ];
      })(),
      weight_min: product.weight_min ?? 1,
      weight_max: product.weight_max ?? 10,
      weight_step: product.weight_step ?? 1
    });
    setIsAddModalOpen(true);
  }

  function toggleWeightOption(w: number) {
    const current: WeightOption[] = editingProduct ? editFormData.weight_options : newProduct.weight_options;
    const exists = current.some((o) => o.weight === w);
    const next = exists
      ? current.filter((o) => o.weight !== w)
      : [...current, { weight: w, price: null }].sort((a, b) => a.weight - b.weight);
    if (editingProduct) setEditFormData({ ...editFormData, weight_options: next });
    else setNewProduct({ ...newProduct, weight_options: next });
  }

  function addCustomWeightOption() {
    const val = parseFloat(customWeightInput);
    if (!val || val <= 0) { setCustomWeightInput(''); return; }
    const current: WeightOption[] = editingProduct ? editFormData.weight_options : newProduct.weight_options;
    if (current.some((o) => o.weight === val)) { setCustomWeightInput(''); return; }
    const next = [...current, { weight: val, price: null }].sort((a, b) => a.weight - b.weight);
    if (editingProduct) setEditFormData({ ...editFormData, weight_options: next });
    else setNewProduct({ ...newProduct, weight_options: next });
    setCustomWeightInput('');
  }

  // Sets (or clears, when priceStr is empty) the special offer price for one
  // specific weight option. Leaving it blank means "no offer — use normal
  // price × kg" for that weight.
  function updateWeightOptionPrice(w: number, priceStr: string) {
    const current: WeightOption[] = editingProduct ? editFormData.weight_options : newProduct.weight_options;
    const price = priceStr === '' ? null : (parseFloat(priceStr) || 0);
    const next = current.map((o) => o.weight === w ? { ...o, price } : o);
    if (editingProduct) setEditFormData({ ...editFormData, weight_options: next });
    else setNewProduct({ ...newProduct, weight_options: next });
  }

  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (editingProduct) {
      // 1. Map UI category to DB slug (category_id is a UUID in the live
      //    database - we save the category NAME, which the website uses)
      let category_slug = 'vegetables';
      if (editFormData.category === 'Fruits') {
        category_slug = 'fruits';
      } else if (editFormData.category === 'Valluvam Products') {
        category_slug = 'trad';
      }

      // 2. Construct clean DB object (removing UI-only fields that crash Supabase)
      const dbUpdate = {
        name: editFormData.name,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        mrp: parseFloat(editFormData.price),
        unit: editFormData.unit,
        stock: editFormData.stock,
        is_featured: editFormData.is_seasonal,
        video_url: editFormData.video_url,
        order_index: editFormData.order_index,
        slug: editFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: editFormData.category,
        category_slug,
        image_url: editFormData.image_url || (editFormData.image_urls || []).find((u: string) => u && u.trim() !== '') || '',
        image_urls: [editFormData.image_url, ...(editFormData.image_urls || [])].filter(url => url && url.trim() !== ''),
        weight_mode: editFormData.weight_mode,
        weight_options: editFormData.weight_options,
        weight_min: Number(editFormData.weight_min) || 1,
        weight_max: Number(editFormData.weight_max) || 10,
        weight_step: Number(editFormData.weight_step) || 1,
        updated_at: new Date().toISOString()
      };

      // Check if the ID is a valid UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(editingProduct.id);
      
      let response;
      if (isUUID) {
        response = await updateProduct(editingProduct.id, dbUpdate);
      } else {
        // For local products, we use upsert by name to ensure they enter the DB correctly
        response = await supabase
          .from('products')
          .upsert({ ...dbUpdate, in_stock: true, is_active: true }, { onConflict: 'name' })
          .select()
          .single();
      }

      const { data, error } = response;
      
      if (!error && data) {
        toast.success('Product updated successfully!');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setProducts((prev: any[]) => prev.map((p: any) => p.id === editingProduct.id ? data : p));
        setIsAddModalOpen(false);
        setEditingProduct(null);
      } else {
        console.error('Update error:', error);
        toast.error(`Update failed: ${error?.message || 'Check database connection'}`);
      }
    } else {
      // Duplicate name check
      if (products.some(p => p.name.toLowerCase() === newProduct.name.toLowerCase() && p.is_synced)) {
        toast.error('A product with this name already exists in the cloud catalog.');
        return;
      }

      // 1. Map UI category to DB slug (category_id is a UUID in the live
      //    database - we save the category NAME, which the website uses)
      let category_slug = 'vegetables';
      if (newProduct.category === 'Fruits') {
        category_slug = 'fruits';
      } else if (newProduct.category === 'Valluvam Products') {
        category_slug = 'trad';
      }

      // 2. Construct clean DB object
      const dbInsert = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        mrp: parseFloat(newProduct.price),
        unit: newProduct.unit,
        stock: newProduct.stock,
        is_featured: newProduct.is_seasonal,
        video_url: newProduct.video_url,
        order_index: newProduct.order_index,
        slug: newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: newProduct.category,
        category_slug,
        image_url: newProduct.image_url || (newProduct.image_urls || []).find((u: string) => u && u.trim() !== '') || '',
        image_urls: [newProduct.image_url, ...(newProduct.image_urls || [])].filter(url => url && url.trim() !== ''),
        weight_mode: newProduct.weight_mode,
        weight_options: newProduct.weight_options,
        weight_min: Number(newProduct.weight_min) || 1,
        weight_max: Number(newProduct.weight_max) || 10,
        weight_step: Number(newProduct.weight_step) || 1,
        in_stock: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('products')
        .insert([dbInsert])
        .select()
        .single();

      if (!error && data) {
        toast.success('Product added successfully!');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setProducts((prev: any[]) => [data, ...prev]);
        setIsAddModalOpen(false);
        setNewProduct({
          name: '',
          category: 'Vegetables',
          price: '',
          description: '',
          unit: 'kg',
          image_url: '',
          video_url: '',
          order_index: 0,
          stock: 100,
          is_seasonal: false,
          image_urls: [''],
          weight_mode: 'fixed',
          weight_options: [
            { weight: 1, price: null },
            { weight: 2, price: null },
            { weight: 5, price: null },
            { weight: 10, price: null }
          ],
          weight_min: 1,
          weight_max: 10,
          weight_step: 1
        });
      } else {
        console.error('Add product error:', error);
        toast.error(`Addition failed: ${error?.message || 'Check database connection'}`);
      }
    }
  }

  async function handleDeleteProduct(productId: string, name: string) {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      const { error } = await deleteProduct(productId);
      if (!error) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      }
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    const matchesStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? product.is_active !== false :
      statusFilter === 'removed' ? product.is_active === false :
      statusFilter === 'featured' ? !!product.is_featured : true;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!isSupabaseConfigured && (
        <div className="bg-red-50 border-2 border-red-200 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl shadow-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 flex-shrink-0">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-red-900 mb-1 tracking-tight">Database Disconnected</h3>
            <p className="text-red-700 font-medium leading-relaxed">
              Your <code className="bg-red-100 px-2 py-0.5 rounded">.env.local</code> file is missing or empty. Please add your Supabase URL and API Key to see your products. 
              Check <code className="bg-red-100 px-2 py-0.5 rounded">.env.example</code> for the required format.
            </p>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 flex-wrap">
        <div className="flex flex-col md:flex-row gap-4 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input 
              type="text" 
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <select 
                className="pl-12 pr-10 py-3 rounded-2xl border border-border bg-white appearance-none focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Valluvam Products">Valluvam Products</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <select 
                className="pl-12 pr-10 py-3 rounded-2xl border border-border bg-white appearance-none focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="removed">Removed Only</option>
                <option value="featured">Freshly Harvested (Featured)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-white border border-border rounded-2xl p-1 mr-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Package size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Filter size={18} />
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleBulkUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isBulkLoading}
            className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground px-6 py-4 rounded-[1.5rem] font-black flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isBulkLoading ? <Loader2 size={20} className="animate-spin" /> : <FileSpreadsheet size={20} />}
            BULK UPLOAD
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
          >
            <Plus size={20} />
            ADD NEW PRODUCT
          </button>

          <button 
            onClick={async () => {
              if (confirm('CRITICAL: This will wipe the cloud catalog and replace it with the 129+ products from your local image folders. Continue?')) {
                setIsBulkLoading(true);
                try {
                  const { syncVerifiedCatalog } = await import('@/lib/admin');
                  const { VERIFIED_INVENTORY } = await import('@/lib/constants');
                  const result = await syncVerifiedCatalog(VERIFIED_INVENTORY);
                  if (result.success) toast.success(`Cloud Sync Complete: ${result.added} items pushed.`);
                  else throw result.error;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (e: any) {
                  toast.error('Sync failed: ' + e.message);
                } finally {
                  setIsBulkLoading(false);
                  fetchProducts();
                }
              }
            }}
            disabled={isBulkLoading}
            className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isBulkLoading ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
            CLOUD SYNC (129+)
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-900 text-white p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-30 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-2 rounded-xl text-primary">
                <Check size={20} />
              </div>
              <span className="font-bold">{selectedProducts.length} products selected</span>
              <button 
                onClick={() => setSelectedProducts([])}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Deselect All
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSelectionDrawer(true)}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/10 mr-2"
              >
                Review {selectedProducts.length} Items
              </button>
              <button 
                disabled={isBulkLoading}
                onClick={() => handleBulkAction('in_stock')}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Set In Stock
              </button>
              <button 
                disabled={isBulkLoading}
                onClick={() => handleBulkAction('out_stock')}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Set Out of Stock
              </button>
              <button 
                disabled={isBulkLoading}
                onClick={() => handleBulkAction('archive')}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Archive
              </button>
              <button 
                disabled={isBulkLoading}
                onClick={() => handleBulkAction('restore')}
                className="bg-primary hover:bg-primary/80 disabled:opacity-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Restore
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
        <input 
          type="checkbox" 
          id="select-all"
          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
          onChange={toggleSelectAll}
        />
        <label htmlFor="select-all" className="cursor-pointer">Select All Products ({filteredProducts.length})</label>
      </div>

      {/* Products Display */}
      {filteredProducts.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white rounded-[2.5rem] border-2 transition-all relative group flex flex-col ${
                  selectedProducts.includes(product.id) ? 'border-primary ring-4 ring-primary/10 shadow-2xl' :
                  product.is_active === false 
                    ? 'border-slate-100 opacity-75 grayscale-[0.5]' 
                    : 'border-border hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10'
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-4 right-4 z-20">
                  <input 
                    type="checkbox" 
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleSelectProduct(product.id)}
                    className="w-6 h-6 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary bg-white/80 backdrop-blur-sm cursor-pointer transition-all"
                  />
                </div>
                {/* Status Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${
                    product.stock > 0 ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
                  }`}>
                    {product.stock > 0 ? '● In Stock' : '○ Out of Stock'}
                  </div>
                  {product.is_seasonal && (
                    <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg bg-accent text-accent-foreground">
                      ★ Seasonal
                    </div>
                  )}
                  {product.is_active === false && (
                    <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg bg-slate-800/90 text-white">
                      Archived
                    </div>
                  )}
                  {product.is_synced === false && (
                    <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg bg-amber-500 text-white">
                      ⚠ Local Only (Needs Sync)
                    </div>
                  )}
                </div>

                {/* Top Action Buttons (Edit/Delete) */}
                <div className="absolute top-4 right-4 z-10 flex gap-2 transition-all">
                  <button 
                    onClick={() => openEditModal(product)}
                    className="p-3 bg-white/95 backdrop-blur-md rounded-2xl text-foreground hover:bg-primary hover:text-white transition-all shadow-xl border border-border"
                    title="Edit Product"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                    className="p-3 bg-white/95 backdrop-blur-md rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl border border-border"
                    title="Permanently Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Image Section */}
                <div className="aspect-[4/3] bg-muted rounded-t-[2.5rem] overflow-hidden relative">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-slate-50">
                      <ImageIcon size={48} strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Content Section */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1 block">{product.category}</span>
                      <h3 className="text-2xl font-black tracking-tight leading-tight">{product.name}</h3>
                    </div>
                    <div className="text-right">
                      {inlineEditingPrice === product.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            className="w-24 px-3 py-2 rounded-xl border-2 border-primary outline-none text-right font-black text-lg"
                            value={newPrice}
                            autoFocus
                            onChange={(e) => setNewPrice(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleInlinePriceUpdate(product.id);
                              if (e.key === 'Escape') setInlineEditingPrice(null);
                            }}
                          />
                        </div>
                      ) : (
                        <div 
                          className="cursor-pointer group/price"
                          onClick={() => {
                            setInlineEditingPrice(product.id);
                            setNewPrice(product.price.toString());
                          }}
                        >
                          <p className="text-3xl font-black text-primary tracking-tighter">₹{product.price}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-right">per {product.unit}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-medium leading-relaxed">
                    {product.description || 'Premium quality farm fresh product delivered straight to your door.'}
                  </p>

                  <button 
                    onClick={() => openEditModal(product)}
                    className="w-full mb-8 py-3 rounded-2xl bg-slate-50 text-slate-900 border border-slate-200 font-black text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2 group/edit"
                  >
                    <Edit size={14} className="group-hover/edit:scale-125 transition-transform" />
                    Edit Full Details
                  </button>

                  {/* Advanced Controls Section */}
                  <div className="mt-auto space-y-4 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inventory Status</span>
                      <div className="flex items-center gap-1">
                        <Package size={14} className="text-muted-foreground" />
                        <span className="text-xs font-bold">{product.stock} Units Available</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Stock Toggles */}
                      <button 
                        onClick={() => toggleStock(product.id, true)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          product.stock > 0 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-white text-slate-400 border border-slate-100 hover:border-emerald-200 hover:text-emerald-500'
                        }`}
                      >
                        <CheckCircle2 size={16} />
                        In Stock
                      </button>
                      <button 
                        onClick={() => toggleStock(product.id, false)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          product.stock === 0 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : 'bg-white text-slate-400 border border-slate-100 hover:border-red-200 hover:text-red-500'
                        }`}
                      >
                        <XCircle size={16} />
                        Out of Stock
                      </button>
                    </div>

                    {/* Featured (Freshly Harvested) Toggle */}
                    <button
                      onClick={() => toggleFeatured(product.id, !product.is_featured)}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        product.is_featured
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-white text-slate-400 border border-slate-100 hover:border-amber-200 hover:text-amber-500'
                      }`}
                      title="Show this product in the homepage 'Freshly Harvested' section"
                    >
                      <Star size={16} className={product.is_featured ? 'fill-amber-500 text-amber-500' : ''} />
                      {product.is_featured ? 'Featured in Freshly Harvested' : 'Add to Freshly Harvested'}
                    </button>

                    {/* Archive/Restore Toggle */}
                    <button 
                      onClick={() => product.is_active !== false ? handleSoftDelete(product.id) : handleRestore(product.id)}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] transition-all ${
                        product.is_active !== false
                          ? 'bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white'
                          : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                      }`}
                    >
                      {product.is_active !== false ? (
                        <>
                          <Ban size={18} />
                          Remove from Website
                        </>
                      ) : (
                        <>
                          <RotateCcw size={18} />
                          Restore to Website
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${selectedProducts.includes(product.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={product.image_url} alt="Product image" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <span className="font-bold text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded-md text-slate-500">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-primary">₹{product.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-bold text-sm">
                        <Package size={14} className="text-slate-400" />
                        {product.stock} {product.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        product.stock > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleFeatured(product.id, !product.is_featured)} title="Show in homepage 'Freshly Harvested'" className={`p-2 rounded-lg transition-all ${product.is_featured ? 'text-amber-500 bg-amber-50' : 'hover:bg-amber-50 hover:text-amber-500'}`}><Star size={16} className={product.is_featured ? 'fill-amber-500' : ''} /></button>
                        <button onClick={() => openEditModal(product)} className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteProduct(product.id, product.name)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-8">
            <Package size={48} />
          </div>
          <h3 className="text-2xl font-black mb-2">No products found</h3>
          <p className="text-muted-foreground font-medium mb-8 max-w-sm text-center">
            Your inventory is currently empty. Start by adding a new product or use the sample products below.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={handleHardReset}
              disabled={isBulkLoading}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"
            >
              {isBulkLoading ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
              Reset Catalog
            </button>

            <button 
              onClick={handleClearCache}
              className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
            >
              <Trash2 size={16} />
              Clear Browser Cache
            </button>

            <button 
              onClick={handleAddSamples}
              disabled={isBulkLoading}
              className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/10 disabled:opacity-50"
            >
              {isBulkLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add Samples
            </button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Modal Sidebar - Image Preview */}
              <div className="w-full md:w-80 bg-slate-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
                <div className="w-full aspect-square bg-white rounded-3xl shadow-inner border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden mb-6 relative group">
                  {(() => {
                    const preview = editingProduct 
                      ? (editFormData.image_url || editFormData.image_urls?.[0]) 
                      : (newProduct.image_url || newProduct.image_urls?.[0]);
                    return preview ? (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
                  ) : (
                    <div className="text-center p-6">
                      <ImageIcon size={48} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Image Uploaded</p>
                    </div>
                  ); })()}
                  <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const loadingToast = toast.loading('Uploading primary image...');
                        try {
                          const uploadedUrl = await uploadProductMedia(file, 'images');
                          if (editingProduct) {
                            setEditFormData({...editFormData, image_url: uploadedUrl});
                          } else {
                            setNewProduct({...newProduct, image_url: uploadedUrl});
                          }
                          toast.success('Primary image updated!', { id: loadingToast });
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } catch (err: any) {
                          toast.error(err.message || 'Upload failed', { id: loadingToast });
                        }
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white p-3 rounded-2xl shadow-xl text-primary">
                      <Upload size={20} />
                    </div>
                  </div>
                </div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Live Preview</h4>
                <p className="text-center text-[10px] text-slate-500 font-medium px-4">This is how your product image will appear to customers.</p>
                
                <div className="mt-8 w-full space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Product Images (Gallery)</label>
                  {(editingProduct ? editFormData.image_urls : newProduct.image_urls).map((url, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="relative group/input flex gap-2">
                        <input 
                          type="text" 
                          className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none font-bold transition-all text-xs pr-10"
                          placeholder={`Image URL ${idx + 1} (or upload below)`}
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...(editingProduct ? editFormData.image_urls : newProduct.image_urls)];
                            newUrls[idx] = e.target.value;
                            if (editingProduct) setEditFormData({...editFormData, image_urls: newUrls});
                            else setNewProduct({...newProduct, image_urls: newUrls});
                          }}
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const loadingToast = toast.loading('Uploading image...');
                                try {
                                  const uploadedUrl = await uploadProductMedia(file, 'images');
                                  const newUrls = [...(editingProduct ? editFormData.image_urls : newProduct.image_urls)];
                                  newUrls[idx] = uploadedUrl;
                                  if (editingProduct) setEditFormData({...editFormData, image_urls: newUrls});
                                  else setNewProduct({...newProduct, image_urls: newUrls});
                                  toast.success('Gallery image updated!', { id: loadingToast });
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                } catch (err: any) {
                                  toast.error(err.message || 'Upload failed', { id: loadingToast });
                                }
                              }
                            }}
                          />
                          <button type="button" className="h-full px-4 bg-slate-100 rounded-xl text-slate-500 hover:bg-primary hover:text-white transition-all">
                            <Upload size={16} />
                          </button>
                        </div>
                        {(editingProduct ? editFormData.image_urls : newProduct.image_urls).length > 1 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const newUrls = [...(editingProduct ? editFormData.image_urls : newProduct.image_urls)].filter((_, i) => i !== idx);
                              if (editingProduct) setEditFormData({...editFormData, image_urls: newUrls});
                              else setNewProduct({...newProduct, image_urls: newUrls});
                            }}
                            className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => {
                      const newUrls = [...(editingProduct ? editFormData.image_urls : newProduct.image_urls), ''];
                      if (editingProduct) setEditFormData({...editFormData, image_urls: newUrls});
                      else setNewProduct({...newProduct, image_urls: newUrls});
                    }}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Add Another Image
                  </button>
                </div>
              </div>

              {/* Modal Body - Form */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight leading-none mb-1">
                      {editingProduct ? 'EDIT PRODUCT' : 'NEW HARVEST'}
                    </h2>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Update your store inventory</p>
                  </div>
                  <button onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleProductSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Product Identity</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none font-bold transition-all text-lg"
                        placeholder="e.g. Alphonso Mangoes"
                        value={editingProduct ? editFormData.name : newProduct.name}
                        onChange={(e) => editingProduct 
                          ? setEditFormData({...editFormData, name: e.target.value})
                          : setNewProduct({...newProduct, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Store Category</label>
                      <select 
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none font-bold appearance-none bg-white transition-all text-lg"
                        value={editingProduct ? editFormData.category : newProduct.category}
                        onChange={(e) => editingProduct
                          ? setEditFormData({...editFormData, category: e.target.value})
                          : setNewProduct({...newProduct, category: e.target.value})}
                      >
                        <option value="Vegetables">Vegetables</option>
                        <option value="Fruits">Fruits</option>
                        <option value="Valluvam Products">Valluvam Products</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Price (INR ₹)</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-lg">₹</span>
                        <input 
                          required
                          type="number" 
                          className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none font-black transition-all text-lg"
                          placeholder="0.00"
                          value={editingProduct ? editFormData.price : newProduct.price}
                          onChange={(e) => editingProduct
                            ? setEditFormData({...editFormData, price: e.target.value})
                            : setNewProduct({...newProduct, price: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Selling Unit</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none font-bold transition-all text-lg"
                        placeholder="e.g. 1 kg / Box / Bunch"
                        value={editingProduct ? editFormData.unit : newProduct.unit}
                        onChange={(e) => editingProduct
                          ? setEditFormData({...editFormData, unit: e.target.value})
                          : setNewProduct({...newProduct, unit: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Current Stock Level</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-lg">
                          <Package size={20} />
                        </span>
                        <input 
                          required
                          type="number" 
                          className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none font-black transition-all text-lg"
                          placeholder="0"
                          value={editingProduct ? editFormData.stock : newProduct.stock}
                          onChange={(e) => editingProduct
                            ? setEditFormData({...editFormData, stock: parseInt(e.target.value) || 0})
                            : setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Display Priority (Lower = First)</label>
                      <input 
                        type="number" 
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none font-bold transition-all text-lg"
                        placeholder="0"
                        value={editingProduct ? editFormData.order_index : newProduct.order_index}
                        onChange={(e) => editingProduct
                          ? setEditFormData({...editFormData, order_index: parseInt(e.target.value) || 0})
                          : setNewProduct({...newProduct, order_index: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Special status</label>
                      <label className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 cursor-pointer hover:border-primary/30 transition-all">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                          checked={editingProduct ? editFormData.is_seasonal : newProduct.is_seasonal}
                          onChange={(e) => editingProduct
                            ? setEditFormData({...editFormData, is_seasonal: e.target.checked})
                            : setNewProduct({...newProduct, is_seasonal: e.target.checked})}
                        />
                        <span className="font-bold text-slate-700">Mark as Seasonal Product</span>
                      </label>
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Product Promo Video (URL or Local Upload)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none font-bold transition-all text-sm"
                          placeholder="e.g. https://www.youtube.com/watch?v=... or local path"
                          value={editingProduct ? editFormData.video_url : newProduct.video_url}
                          onChange={(e) => editingProduct
                            ? setEditFormData({...editFormData, video_url: e.target.value})
                            : setNewProduct({...newProduct, video_url: e.target.value})}
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="video/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const loadingToast = toast.loading('Uploading video...');
                                try {
                                  const uploadedUrl = await uploadProductMedia(file, 'videos');
                                  if (editingProduct) setEditFormData({...editFormData, video_url: uploadedUrl});
                                  else setNewProduct({...newProduct, video_url: uploadedUrl});
                                  toast.success('Video uploaded!', { id: loadingToast });
                                } catch (err) {
                                  toast.error('Upload failed. Ensure bucket "products" exists.', { id: loadingToast });
                                }
                              }
                            }}
                          />
                          <button type="button" className="h-full px-6 bg-slate-900 rounded-2xl text-white hover:bg-primary transition-all flex items-center gap-2">
                            <Upload size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Quantity Options: admin controls exactly which weights/quantities the customer can choose on the product page. */}
                  <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Customer Quantity Options</label>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => editingProduct
                          ? setEditFormData({ ...editFormData, weight_mode: 'fixed' })
                          : setNewProduct({ ...newProduct, weight_mode: 'fixed' })}
                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border-2 transition-all ${
                          (editingProduct ? editFormData.weight_mode : newProduct.weight_mode) === 'fixed'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 bg-white text-slate-500'
                        }`}
                      >
                        Fixed Options
                      </button>
                      <button
                        type="button"
                        onClick={() => editingProduct
                          ? setEditFormData({ ...editFormData, weight_mode: 'range' })
                          : setNewProduct({ ...newProduct, weight_mode: 'range' })}
                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border-2 transition-all ${
                          (editingProduct ? editFormData.weight_mode : newProduct.weight_mode) === 'range'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 bg-white text-slate-500'
                        }`}
                      >
                        Range
                      </button>
                    </div>

                    {(editingProduct ? editFormData.weight_mode : newProduct.weight_mode) === 'fixed' ? (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500 font-medium">Tick the weights customers should be able to choose. Untick one to hide it (e.g. hide 1 kg and keep only 5 kg / 10 kg).</p>
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 5, 10, 15, 20, 25, 50].map((w) => {
                            const current: WeightOption[] = editingProduct ? editFormData.weight_options : newProduct.weight_options;
                            const checked = current.some((o) => o.weight === w);
                            return (
                              <button
                                type="button"
                                key={w}
                                onClick={() => toggleWeightOption(w)}
                                className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${checked ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 bg-white text-slate-500 hover:border-primary/40'}`}
                              >
                                {w} kg
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="Custom value (e.g. 30)"
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-primary/30 outline-none font-bold text-sm"
                            value={customWeightInput}
                            onChange={(e) => setCustomWeightInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomWeightOption(); } }}
                          />
                          <button type="button" onClick={addCustomWeightOption} className="px-5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all">
                            Add
                          </button>
                        </div>

                        {/* Per-weight special offer price: leave blank to charge the
                            normal price × kg; fill in a rupee amount to run a special
                            offer for that exact weight (e.g. 5 kg at ₹250 instead of ₹300). */}
                        {(editingProduct ? editFormData.weight_options : newProduct.weight_options).length > 0 && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Special Price (₹) — optional, per weight</label>
                            {(editingProduct ? editFormData.weight_options : newProduct.weight_options)
                              .slice()
                              .sort((a: WeightOption, b: WeightOption) => a.weight - b.weight)
                              .map((o: WeightOption) => {
                                const base = parseFloat(editingProduct ? editFormData.price : newProduct.price) || 0;
                                const defaultPrice = base * o.weight;
                                return (
                                  <div key={o.weight} className="flex items-center gap-2 bg-white border-2 border-slate-100 rounded-xl px-3 py-2">
                                    <span className="font-bold text-sm text-slate-700 w-16 flex-shrink-0">{o.weight} kg</span>
                                    <span className="text-slate-300 font-bold">₹</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder={`Normal: ${defaultPrice ? defaultPrice.toFixed(0) : '0'}`}
                                      className="flex-1 px-3 py-1.5 rounded-lg border-2 border-slate-100 focus:border-primary/30 outline-none font-bold text-sm"
                                      value={o.price === null || o.price === undefined ? '' : o.price}
                                      onChange={(e) => updateWeightOptionPrice(o.weight, e.target.value)}
                                    />
                                    {o.price !== null && o.price !== undefined && (
                                      <span className="text-[9px] font-black uppercase tracking-wide text-red-600 bg-red-50 px-2 py-1 rounded-full flex-shrink-0">Offer</span>
                                    )}
                                    <button type="button" onClick={() => toggleWeightOption(o.weight)} className="text-slate-300 hover:text-red-500 flex-shrink-0"><X size={14} /></button>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                        {(editingProduct ? editFormData.weight_options : newProduct.weight_options).length === 0 && (
                          <p className="text-red-500 text-xs font-bold">Select at least one weight, otherwise customers won&apos;t be able to order this product.</p>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Min (kg)</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-primary/30 outline-none font-bold text-sm"
                            value={editingProduct ? editFormData.weight_min : newProduct.weight_min}
                            onChange={(e) => editingProduct
                              ? setEditFormData({ ...editFormData, weight_min: parseFloat(e.target.value) || 1 })
                              : setNewProduct({ ...newProduct, weight_min: parseFloat(e.target.value) || 1 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Max (kg)</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-primary/30 outline-none font-bold text-sm"
                            value={editingProduct ? editFormData.weight_max : newProduct.weight_max}
                            onChange={(e) => editingProduct
                              ? setEditFormData({ ...editFormData, weight_max: parseFloat(e.target.value) || 1 })
                              : setNewProduct({ ...newProduct, weight_max: parseFloat(e.target.value) || 1 })}
                          />
                        </div>
                        <p className="col-span-2 text-xs text-slate-500 font-medium">Customers can choose any whole quantity between Min and Max (e.g. 1 to 50 kg).</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Product Story / Description</label>
                    <textarea 
                      rows={4}
                      className="w-full px-6 py-5 rounded-3xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none font-bold resize-none transition-all text-base leading-relaxed"
                      placeholder="Share some details about the freshness and source of this product..."
                      value={editingProduct ? editFormData.description : newProduct.description}
                      onChange={(e) => editingProduct
                        ? setEditFormData({...editFormData, description: e.target.value})
                        : setNewProduct({...newProduct, description: e.target.value})}
                    />
                  </div>

                  <div className="pt-4 flex gap-4 sticky bottom-0 bg-white pb-2">
                    <button 
                      type="button"
                      onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                      className="flex-1 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.1em] text-slate-500 border-2 border-slate-100 hover:bg-slate-50 transition-all text-xs"
                    >
                      Discard Changes
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] bg-primary text-white hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-[0.98] text-xs shadow-xl shadow-primary/10"
                    >
                      {editingProduct ? 'Update Product Details' : 'Launch New Product'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Selection Review Drawer */}
      <AnimatePresence>
        {showSelectionDrawer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSelectionDrawer(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="bg-white w-full max-w-md h-full rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black">Selection Review</h3>
                  <p className="text-xs text-muted-foreground font-bold">{selectedProducts.length} items currently selected</p>
                </div>
                <button onClick={() => setShowSelectionDrawer(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                {products.filter(p => selectedProducts.includes(p.id)).map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={p.image_url} alt="Product image" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{p.name}</p>
                      <p className="text-[10px] font-black uppercase text-primary/60">{p.category}</p>
                    </div>
                    <button 
                      onClick={() => toggleSelectProduct(p.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => { handleBulkAction('in_stock'); setShowSelectionDrawer(false); }}
                    className="py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                  >
                    Mark In Stock
                  </button>
                  <button 
                    onClick={() => { handleBulkAction('out_stock'); setShowSelectionDrawer(false); }}
                    className="py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20"
                  >
                    Mark Out Stock
                  </button>
                </div>
                <button 
                  onClick={() => setSelectedProducts([])}
                  className="w-full mt-4 py-4 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-all"
                >
                  Clear Selection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminProducts() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold">Loading products...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
