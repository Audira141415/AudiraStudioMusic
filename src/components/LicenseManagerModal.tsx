import React, { useState } from 'react';
import { 
  Key, 
  X, 
  Plus, 
  ShieldCheck, 
  Copy, 
  Check, 
  Trash2, 
  Download, 
  Clock, 
  Sparkles,
  Users,
  Search
} from 'lucide-react';

export interface LicenseRecord {
  id: string;
  key: string;
  clientName: string;
  clientEmail: string;
  tier: 'Lifetime VIP Unlimited' | '1 Year VIP Pro' | '30 Days Trial Pro';
  maxSlots: number;
  createdDate: string;
  expiryDate: string;
  status: 'Active' | 'Revoked' | 'Expired';
}

interface LicenseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: string;
}

const DEFAULT_LICENSES: LicenseRecord[] = [
  {
    id: 'lic_001',
    key: 'AUDIRA-2026-VIP-FULL-ACCESS',
    clientName: 'Agus Dwi R (AUDIRA)',
    clientEmail: 'admin@audirastudio.com',
    tier: 'Lifetime VIP Unlimited',
    maxSlots: 5,
    createdDate: '15/08/2026',
    expiryDate: 'Lifetime Unlimited',
    status: 'Active'
  },
  {
    id: 'lic_002',
    key: 'AUDIRA-2026-ADMIN-9981-X4K2',
    clientName: 'Studio Editor 1',
    clientEmail: 'editor1@audirastudio.com',
    tier: '1 Year VIP Pro',
    maxSlots: 3,
    createdDate: '10/08/2026',
    expiryDate: '10/08/2027',
    status: 'Active'
  },
  {
    id: 'lic_003',
    key: 'AUDIRA-2026-USER-4412-M791',
    clientName: 'Creator Member',
    clientEmail: 'member@audirastudio.com',
    tier: '30 Days Trial Pro',
    maxSlots: 2,
    createdDate: '01/08/2026',
    expiryDate: '31/08/2026',
    status: 'Active'
  }
];

export const LicenseManagerModal: React.FC<LicenseManagerModalProps> = ({
  isOpen,
  onClose,
  currentUserRole
}) => {
  const [licenses, setLicenses] = useState<LicenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('audira_license_db');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LICENSES;
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Generator
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [tier, setTier] = useState<'Lifetime VIP Unlimited' | '1 Year VIP Pro' | '30 Days Trial Pro'>('1 Year VIP Pro');
  const [maxSlots, setMaxSlots] = useState<number>(3);

  if (!isOpen) return null;

  const isSuperAdmin = currentUserRole === 'SuperAdmin';

  const saveLicensesToStorage = (updated: LicenseRecord[]) => {
    setLicenses(updated);
    localStorage.setItem('audira_license_db', JSON.stringify(updated));
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim()) {
      alert("Harap isi nama dan email pengguna!");
      return;
    }

    const rand1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const rand2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newKeyStr = `AUDIRA-2026-${tier.includes('Lifetime') ? 'VIP' : tier.includes('Year') ? 'PRO' : 'TRIAL'}-${rand1}-${rand2}`;

    const now = new Date();
    const createdDate = now.toLocaleDateString('id-ID');
    let expiryDate = 'Lifetime Unlimited';
    if (tier === '1 Year VIP Pro') {
      const exp = new Date();
      exp.setFullYear(exp.getFullYear() + 1);
      expiryDate = exp.toLocaleDateString('id-ID');
    } else if (tier === '30 Days Trial Pro') {
      const exp = new Date();
      exp.setDate(exp.getDate() + 30);
      expiryDate = exp.toLocaleDateString('id-ID');
    }

    const newRecord: LicenseRecord = {
      id: `lic_${Date.now()}`,
      key: newKeyStr,
      clientName,
      clientEmail,
      tier,
      maxSlots,
      createdDate,
      expiryDate,
      status: 'Active'
    };

    saveLicensesToStorage([newRecord, ...licenses]);
    setClientName('');
    setClientEmail('');
    alert(`✨ Kunci Lisensi Baru Berhasil Dibuat!\n\nKey: ${newKeyStr}`);
  };

  const handleCopyKey = (keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKey(keyStr);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleStatus = (id: string) => {
    const updated = licenses.map(lic => {
      if (lic.id === id) {
        const nextStatus = lic.status === 'Active' ? 'Revoked' : 'Active';
        return { ...lic, status: nextStatus as any };
      }
      return lic;
    });
    saveLicensesToStorage(updated);
  };

  const handleDeleteLicense = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus lisensi ini dari database?")) {
      const updated = licenses.filter(lic => lic.id !== id);
      saveLicensesToStorage(updated);
    }
  };

  const handleExportDatabase = () => {
    const dataStr = JSON.stringify(licenses, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audira_licenses_backup_${Date.now()}.json`;
    a.click();
  };

  const filteredLicenses = licenses.filter(lic => 
    lic.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lic.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lic.clientEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#FAF6ED] border-4 border-black rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[8px_8px_0px_#000] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-[#8B5CF6] text-white border-b-4 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-amber-400 border-2 border-white/20 shadow-[2px_2px_0px_#000]">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span>SuperAdmin License Management Suite</span>
                <span className="bg-amber-400 text-black text-[9px] px-2 py-0.5 rounded font-mono font-black">SUPERADMIN ACCESS</span>
              </h2>
              <p className="text-xs font-bold text-purple-200">
                Kelola kunci lisensi VIP, buat kunci lisensi baru, atur kuota slot render, dan kontrol status pengguna.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white border-2 border-black rounded-xl font-black flex items-center justify-center shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {!isSuperAdmin && (
            <div className="p-4 bg-amber-100 border-3 border-black rounded-xl font-bold text-xs text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Perhatian: Anda saat ini login sebagai role non-SuperAdmin. Mode pratinjau lisensi diaktifkan.</span>
            </div>
          )}

          {/* Generator Form Section */}
          <div className="bg-white border-3 border-black p-5 rounded-2xl shadow-[4px_4px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
              <h3 className="text-sm font-black uppercase text-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Buat Kunci Lisensi Baru (VIP Generator)</span>
              </h3>
              <span className="text-[10px] font-bold text-black/50 uppercase font-mono">Format: AUDIRA-2026-XXXX-YYYY</span>
            </div>

            <form onSubmit={handleGenerateKey} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-black block">Nama Pengguna / Lisensi:</label>
                <input
                  type="text"
                  placeholder="Contoh: Studio Creator Pro"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-[#FAF6ED] border-2 border-black rounded-lg p-2 font-bold text-xs shadow-[1.5px_1.5px_0px_#000]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-black block">Email Terdaftar:</label>
                <input
                  type="email"
                  placeholder="user@creator.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-[#FAF6ED] border-2 border-black rounded-lg p-2 font-bold text-xs shadow-[1.5px_1.5px_0px_#000]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-black block">Tier Lisensi:</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as any)}
                  className="w-full bg-[#FAF6ED] border-2 border-black rounded-lg p-2 font-bold text-xs shadow-[1.5px_1.5px_0px_#000]"
                >
                  <option value="Lifetime VIP Unlimited">Lifetime VIP Unlimited</option>
                  <option value="1 Year VIP Pro">1 Year VIP Pro</option>
                  <option value="30 Days Trial Pro">30 Days Trial Pro</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-black block">Batas Slot Render Paralel:</label>
                <select
                  value={maxSlots}
                  onChange={(e) => setMaxSlots(parseInt(e.target.value))}
                  className="w-full bg-[#FAF6ED] border-2 border-black rounded-lg p-2 font-bold text-xs shadow-[1.5px_1.5px_0px_#000]"
                >
                  <option value={1}>1 Worker Slot (Standard)</option>
                  <option value={2}>2 Worker Slots (Pro Dual)</option>
                  <option value={3}>3 Worker Slots (VIP Triple)</option>
                  <option value={5}>5 Worker Slots (Enterprise Extreme)</option>
                </select>
              </div>

              <div className="md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FBBF24] hover:bg-yellow-400 text-black border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Hasilkan & Daftarkan Kunci Lisensi Baru</span>
                </button>
              </div>
            </form>
          </div>

          {/* Database Table Section */}
          <div className="bg-white border-3 border-black p-5 rounded-2xl shadow-[4px_4px_0px_#000] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-black uppercase text-black">Daftar Lisensi Aktif ({filteredLicenses.length})</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-black/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari lisensi / nama..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#FAF6ED] border-2 border-black rounded-lg pl-8 pr-3 py-1 font-bold text-xs shadow-[1px_1px_0px_#000]"
                  />
                </div>

                <button
                  onClick={handleExportDatabase}
                  className="px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-lg font-black text-xs uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor JSON</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border-2 border-black rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-amber-100 border-b-2 border-black text-black font-black uppercase text-[10px]">
                    <th className="p-3">Pengguna & Email</th>
                    <th className="p-3">Kunci Lisensi (Key)</th>
                    <th className="p-3">Tier</th>
                    <th className="p-3 text-center">Slot Worker</th>
                    <th className="p-3">Kadaluarsa</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-black/10 font-bold">
                  {filteredLicenses.map(lic => (
                    <tr key={lic.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3">
                        <div className="font-black text-black">{lic.clientName}</div>
                        <div className="text-[10px] text-black/60 font-mono">{lic.clientEmail}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-purple-950 bg-purple-100/80 px-2 py-1 rounded border border-purple-400/30 flex items-center justify-between gap-2 max-w-[240px]">
                          <span className="truncate">{lic.key}</span>
                          <button
                            onClick={() => handleCopyKey(lic.key)}
                            className="p-1 text-purple-700 hover:text-purple-900 cursor-pointer shrink-0"
                            title="Salin Key"
                          >
                            {copiedKey === lic.key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-black text-amber-400 rounded text-[9px] font-black uppercase">
                          {lic.tier}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-black text-purple-900">
                        {lic.maxSlots} Slots
                      </td>
                      <td className="p-3 text-[11px] text-black/75">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-black/50" />
                          <span>{lic.expiryDate}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border border-black ${
                          lic.status === 'Active' ? 'bg-emerald-400 text-black' : 'bg-red-400 text-white'
                        }`}>
                          {lic.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(lic.id)}
                            className={`px-2 py-1 rounded border-2 border-black font-black text-[9px] uppercase cursor-pointer ${
                              lic.status === 'Active' ? 'bg-amber-200 hover:bg-amber-300 text-black' : 'bg-emerald-200 text-emerald-900'
                            }`}
                          >
                            {lic.status === 'Active' ? 'Revoke' : 'Activate'}
                          </button>

                          <button
                            onClick={() => handleDeleteLicense(lic.id)}
                            className="p-1 bg-red-100 hover:bg-red-200 text-red-600 border border-black rounded cursor-pointer"
                            title="Hapus Lisensi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-amber-100 border-t-2 border-black flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-black/70">
            Audira VIP License Protection System © 2026 by AUDIRA (Agus Dwi R)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-black shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            Tutup Management Suite
          </button>
        </div>

      </div>
    </div>
  );
};
