'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Plus, Edit, Trash2, 
  BarChart3, Upload, FileText, CheckCircle, AlertTriangle, ChevronRight 
} from 'lucide-react';
import { appsApi, categoriesApi, authApi, AppData, Category } from '../../lib/api';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DashboardPage() {
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [apps, setApps] = useState<AppData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'manage' | 'upload' | 'analytics'>('manage');

  // App Form States
  const [name, setName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [versionName, setVersionName] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState('1');
  const [appSize, setAppSize] = useState('15 MB');
  const [minAndroid, setMinAndroid] = useState('8.0');
  const [targetAndroid, setTargetAndroid] = useState('13.0');
  const [categoryId, setCategoryId] = useState('');
  
  // Toggles
  const [isOffline, setIsOffline] = useState(false);
  const [isAiPowered, setIsAiPowered] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isEditorsChoice, setIsEditorsChoice] = useState(false);

  // File Inputs
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<FileList | null>(null);

  // Status logs
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    // Check if user is Admin
    authApi.getProfile()
      .then(res => {
        if (res.user.role === 'ADMIN') {
          setIsAdmin(true);
          loadDashboardData();
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, []);

  const loadDashboardData = async () => {
    try {
      const [allApps, cats] = await Promise.all([
        appsApi.getAll(),
        categoriesApi.getAll()
      ]);
      setApps(allApps);
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteApp = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application? This will clean up its files from the storage.')) return;
    try {
      await appsApi.delete(id);
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert('Delete failed.');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    setStatusType('');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('packageName', packageName);
    formData.append('shortDescription', shortDescription);
    formData.append('description', description);
    formData.append('versionName', versionName);
    formData.append('versionCode', versionCode);
    formData.append('appSize', appSize);
    formData.append('minAndroid', minAndroid);
    formData.append('targetAndroid', targetAndroid);
    formData.append('categoryId', categoryId);

    formData.append('isOffline', String(isOffline));
    formData.append('isAiPowered', String(isAiPowered));
    formData.append('isFeatured', String(isFeatured));
    formData.append('isTrending', String(isTrending));
    formData.append('isEditorsChoice', String(isEditorsChoice));

    if (apkFile) formData.append('apkFile', apkFile);
    if (iconFile) formData.append('iconFile', iconFile);
    if (bannerFile) formData.append('bannerFile', bannerFile);
    
    if (screenshotFiles) {
      for (let i = 0; i < screenshotFiles.length; i++) {
        formData.append('screenshotFiles', screenshotFiles[i]);
      }
    }

    try {
      await appsApi.create(formData);
      setStatusMessage('Application successfully created and files saved!');
      setStatusType('success');
      
      // Reset form variables
      setName('');
      setPackageName('');
      setShortDescription('');
      setDescription('');
      setVersionName('1.0.0');
      setVersionCode('1');
      setAppSize('15 MB');
      
      setIsOffline(false);
      setIsAiPowered(false);
      setIsFeatured(false);
      setIsTrending(false);
      setIsEditorsChoice(false);
      
      setApkFile(null);
      setIconFile(null);
      setBannerFile(null);
      setScreenshotFiles(null);
      
      loadDashboardData();
      setActiveTab('manage');
    } catch (err: any) {
      console.error(err);
      setStatusMessage(err.response?.data?.error || 'Failed to upload and seed application.');
      setStatusType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAdmin === null) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-gray-500 font-semibold">Validating credentials...</div>;
  }

  if (isAdmin === false) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 border border-red-100 rounded-3xl bg-red-50 text-center space-y-4 shadow-soft">
        <AlertTriangle size={48} className="text-red-500 mx-auto" />
        <h2 className="text-lg font-black text-red-950">Access Denied</h2>
        <p className="text-xs text-red-700 leading-relaxed font-semibold">
          You do not have administrative privileges to access this console. Please sign in with an admin credentials account.
        </p>
        <button
          onClick={() => router.push('/auth/login')}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-6 rounded-2xl transition-all shadow-soft"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 md:space-y-5">
      {/* Back button */}
      <div className="flex items-center">
        <Link 
          href="/" 
          className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-primary transition-colors gap-1 group bg-gray-50 border border-gray-100 px-4 py-2 rounded-full shadow-soft"
        >
          <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
      </div>
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-gray-100 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="text-primary" /> Developer Console
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage app builds, view logs, and track statistics metrics.</p>
        </div>

        {/* Tab buttons */}
        <div className="inline-flex bg-gray-50 border border-gray-100 rounded-2xl p-1 text-xs font-bold text-gray-500">
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-4 rounded-xl transition-all ${
              activeTab === 'manage' ? 'bg-white text-gray-900 shadow-soft font-black' : 'hover:text-primary'
            }`}
          >
            Manage Apps
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-4 rounded-xl transition-all ${
              activeTab === 'upload' ? 'bg-white text-gray-900 shadow-soft font-black' : 'hover:text-primary'
            }`}
          >
            Upload New App
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-4 rounded-xl transition-all ${
              activeTab === 'analytics' ? 'bg-white text-gray-900 shadow-soft font-black' : 'hover:text-primary'
            }`}
          >
            Analytics Metrics
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
          statusType === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {statusType === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. TAB CONTENT: Manage apps */}
      {activeTab === 'manage' && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-gray-900 text-lg">Seeded Apps Directory ({apps.length})</h3>
            <button
              onClick={() => setActiveTab('upload')}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4.5 py-2.5 rounded-full shadow-soft transition-all flex items-center gap-1.5"
            >
              <Plus size={14} /> Add App
            </button>
          </div>

          <div className="overflow-x-auto no-scrollbar border border-gray-50 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="py-4 px-6 font-bold">Icon & Name</th>
                  <th className="py-4 px-6 font-bold hidden sm:table-cell">Package Name</th>
                  <th className="py-4 px-6 font-bold hidden sm:table-cell">Version</th>
                  <th className="py-4 px-6 font-bold">Downloads</th>
                  <th className="py-4 px-6 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-muted-custom/35 transition-colors">
                    <td className="py-4 px-6 flex items-center space-x-3">
                      <img
                        src={app.iconUrl.startsWith('/') ? `${BACKEND_URL}${app.iconUrl}` : app.iconUrl}
                        alt={app.name}
                        className="w-10 h-10 rounded-lg object-cover bg-white border border-gray-100 flex-shrink-0"
                      />
                      <span className="font-bold text-gray-900 text-sm">{app.name}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-500 hidden sm:table-cell">{app.packageName}</td>
                    <td className="py-4 px-6 font-semibold text-gray-700 hidden sm:table-cell">v{app.versionName}</td>
                    <td className="py-4 px-6 font-extrabold text-gray-900">{app.downloadsCount}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2.5">
                        <button
                          onClick={() => handleDeleteApp(app.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete App"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: Upload form */}
      {activeTab === 'upload' && (
        <form onSubmit={handleUploadSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
          <h3 className="font-extrabold text-gray-900 text-lg">Scaffold Application Metadata</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left section fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">App Name</label>
                <input
                  type="text"
                  placeholder="e.g. 'MGPT'"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Package Name</label>
                <input
                  type="text"
                  placeholder="com.manavstech.app"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Version Name</label>
                  <input
                    type="text"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Version Code</label>
                  <input
                    type="number"
                    value={versionCode}
                    onChange={(e) => setVersionCode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">App Size</label>
                  <input
                    type="text"
                    value={appSize}
                    onChange={(e) => setAppSize(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Min Android</label>
                  <input
                    type="text"
                    value={minAndroid}
                    onChange={(e) => setMinAndroid(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Target Android</label>
                  <input
                    type="text"
                    value={targetAndroid}
                    onChange={(e) => setTargetAndroid(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Short Description</label>
                <input
                  type="text"
                  placeholder="One sentence pitch..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Detailed Description</label>
                <textarea
                  placeholder="Write description features, permissions specifications..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Right section fields: Files & Toggles */}
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Toggles */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4.5 space-y-3.5">
                <label className="text-xs font-black text-gray-900 uppercase tracking-widest block border-b border-gray-200 pb-2">App Config Flags</label>
                
                <div className="grid grid-cols-2 gap-3 text-xs font-bold text-gray-600">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input type="checkbox" checked={isOffline} onChange={(e) => setIsOffline(e.target.checked)} className="rounded border-gray-200 text-primary w-4.5 h-4.5" />
                    <span>Offline App</span>
                  </label>
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input type="checkbox" checked={isAiPowered} onChange={(e) => setIsAiPowered(e.target.checked)} className="rounded border-gray-200 text-primary w-4.5 h-4.5" />
                    <span>AI Powered</span>
                  </label>
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-gray-200 text-primary w-4.5 h-4.5" />
                    <span>Featured Carousel</span>
                  </label>
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} className="rounded border-gray-200 text-primary w-4.5 h-4.5" />
                    <span>Trending App</span>
                  </label>
                  <label className="flex items-center space-x-2.5 cursor-pointer col-span-2">
                    <input type="checkbox" checked={isEditorsChoice} onChange={(e) => setIsEditorsChoice(e.target.checked)} className="rounded border-gray-200 text-primary w-4.5 h-4.5" />
                    <span>Editor's Choice Badge</span>
                  </label>
                </div>
              </div>

              {/* Upload Pickers */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4.5 space-y-4">
                <label className="text-xs font-black text-gray-900 uppercase tracking-widest block border-b border-gray-200 pb-2 flex items-center gap-1"><Upload size={14} /> File Attachments</label>
                
                <div className="space-y-3.5 text-xs text-gray-500 font-bold">
                  <div className="flex flex-col gap-1">
                    <span>APK File (Max 50MB)</span>
                    <input type="file" accept=".apk" onChange={(e) => setApkFile(e.target.files?.[0] || null)} className="w-full bg-white border border-gray-200 rounded-xl p-2 text-[10px]" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span>App Icon (PNG/JPEG)</span>
                    <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0] || null)} className="w-full bg-white border border-gray-200 rounded-xl p-2 text-[10px]" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span>App Feature Banner (Optional)</span>
                    <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} className="w-full bg-white border border-gray-200 rounded-xl p-2 text-[10px]" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span>Screenshots (Upload up to 8 images)</span>
                    <input type="file" accept="image/*" multiple onChange={(e) => setScreenshotFiles(e.target.files)} className="w-full bg-white border border-gray-200 rounded-xl p-2 text-[10px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-50 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-8 py-3.5 rounded-full shadow-soft hover:shadow-md3 transition-all"
            >
              {isSubmitting ? 'Uploading and generating schemas...' : 'Add Application'}
            </button>
          </div>
        </form>
      )}

      {/* 4. TAB CONTENT: Store Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft space-y-4">
            <h3 className="text-gray-900 font-extrabold text-sm border-b border-gray-50 pb-2 flex items-center gap-1.5"><BarChart3 size={16} /> Total Downloads Stats</h3>
            <div className="space-y-3.5">
              {apps.map((app) => (
                <div key={app.id} className="flex justify-between items-center text-xs text-gray-600 font-semibold border-b border-gray-50 pb-2">
                  <span>{app.name}</span>
                  <span className="font-bold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-xl">{app.downloadsCount} dl</span>
                </div>
              ))}
            </div>
          </div>

          {/* Device Mockup */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft space-y-4">
            <h3 className="text-gray-900 font-extrabold text-sm border-b border-gray-50 pb-2 flex items-center gap-1.5"><FileText size={16} /> Categories Weight</h3>
            <div className="space-y-3.5">
              {categories.map((c) => (
                <div key={c.id} className="flex justify-between items-center text-xs text-gray-600 font-semibold">
                  <span>{c.name}</span>
                  <span className="font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-xl">{c._count?.apps || 0} Apps</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft space-y-4 text-xs font-semibold text-gray-500">
            <h3 className="text-gray-900 font-extrabold text-sm border-b border-gray-50 pb-2">Integrations logs</h3>
            <p>Database Connector: SQLite Client</p>
            <p>Static Asset Directory: local server `/uploads` override config</p>
            <p>JWT Signature Expire: 7 Days</p>
            <p className="text-emerald-600 flex items-center gap-1.5 pt-4">
              <CheckCircle size={14} /> Local system healthy & connected.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
