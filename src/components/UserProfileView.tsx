import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Key, 
  Crown, 
  Star, 
  Save, 
  Check, 
  Plus, 
  Sparkles,
  Users,
  Copy,
  CheckCircle2,
  Mail,
  Building,
  Calendar,
  Cpu
} from 'lucide-react';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'User';
  avatar: string;
  studioName: string;
  bio: string;
  licenseKey: string;
  memberSince: string;
}

export interface UserAccountItem {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'User';
  status: 'Active' | 'Suspended' | 'Pending';
  lastActive: string;
  licenseKey: string;
}

interface UserProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  accountsList: UserAccountItem[];
  onUpdateUserRole: (userId: string, newRole: 'Super Admin' | 'Admin' | 'User') => void;
  onAddLicenseKey: (key: string, role: 'Super Admin' | 'Admin' | 'User') => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  profile,
  onUpdateProfile,
  accountsList,
  onUpdateUserRole,
  onAddLicenseKey
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'license' | 'management'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Edit Form State
  const [formData, setFormData] = useState({
    name: profile.name,
    username: profile.username,
    email: profile.email,
    studioName: profile.studioName,
    bio: profile.bio,
    avatar: profile.avatar
  });

  const [inputLicense, setInputLicense] = useState('');
  const [licenseMsg, setLicenseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // License Generator State
  const [genRole, setGenRole] = useState<'Admin' | 'User'>('Admin');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleActivateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLicense.trim()) return;

    if (inputLicense.toUpperCase().includes('VIP') || inputLicense.toUpperCase().includes('PRO') || inputLicense.toUpperCase().includes('AUDIRA')) {
      setLicenseMsg({ type: 'success', text: '✨ Kunci Lisensi Berhasil Diaktifkan! Akun Anda kini berstatus Pro VIP.' });
      onUpdateProfile({ role: 'Super Admin', licenseKey: inputLicense.toUpperCase() });
      setInputLicense('');
    } else {
      setLicenseMsg({ type: 'error', text: '❌ Format Kunci Lisensi Tidak Valid. Gunakan format AUDIRA-2026-XXXX.' });
    }
  };

  const handleGenerateKey = () => {
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const key = `AUDIRA-2026-${genRole.toUpperCase()}-${randomCode}`;
    setGeneratedKey(key);
    setCopiedKey(false);
    onAddLicenseKey(key, genRole);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Profile Banner Card */}
      <div className="p-6 bg-[#FEF3C7] border-[3px] border-black rounded-2xl shadow-[5px_5px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar Image with Neobrutalist Shadow */}
          <div className="relative">
            <img 
              src={profile.avatar || presetAvatars[0]} 
              alt={profile.name} 
              className="w-24 h-24 rounded-2xl border-[3px] border-black object-cover shadow-[3px_3px_0px_#000]" 
            />
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-yellow-400 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">
              {profile.role === 'Super Admin' ? (
                <Crown className="w-5 h-5 text-black" />
              ) : profile.role === 'Admin' ? (
                <Star className="w-5 h-5 text-black" />
              ) : (
                <User className="w-5 h-5 text-black" />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black uppercase text-black tracking-wide">{profile.name}</h1>
              {/* Role Badge */}
              <span className={`px-3 py-1 border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 ${
                profile.role === 'Super Admin' 
                  ? 'bg-purple-600 text-white' 
                  : profile.role === 'Admin' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-emerald-500 text-white'
              }`}>
                {profile.role === 'Super Admin' && <Crown className="w-3.5 h-3.5" />}
                {profile.role === 'Admin' && <Star className="w-3.5 h-3.5" />}
                {profile.role === 'User' && <User className="w-3.5 h-3.5" />}
                <span>{profile.role}</span>
              </span>
            </div>

            <p className="text-xs font-bold text-black/70 flex items-center gap-3">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-black" /> {profile.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-black" /> {profile.studioName}</span>
            </p>
            <p className="text-xs text-black/80 font-medium italic pt-0.5">"{profile.bio}"</p>
          </div>
        </div>

        {/* Quick License Status Pill */}
        <div className="bg-white border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_#000] space-y-1 text-right self-stretch md:self-auto flex flex-col justify-center">
          <span className="text-[10px] font-black uppercase text-black/60 block">Status Lisensi Pengguna:</span>
          <span className="font-mono font-black text-xs text-purple-700 bg-purple-100 px-2.5 py-1 rounded border border-black inline-block">
            {profile.licenseKey || 'AUDIRA-2026-VIP-FULL'}
          </span>
          <span className="text-[9px] font-bold text-emerald-600 flex items-center justify-end gap-1 pt-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terverifikasi VIP AUDIRA © 2026
          </span>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex border-b-2 border-black gap-2 select-none">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-5 py-3 font-black text-xs uppercase tracking-wider border-2 border-b-0 border-black rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-yellow-400 text-black shadow-[3px_-3px_0px_#000]'
              : 'bg-white text-black hover:bg-amber-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>👤 Profil Pengguna</span>
        </button>

        <button
          onClick={() => setActiveSubTab('license')}
          className={`px-5 py-3 font-black text-xs uppercase tracking-wider border-2 border-b-0 border-black rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'license'
              ? 'bg-purple-500 text-white shadow-[3px_-3px_0px_#000]'
              : 'bg-white text-black hover:bg-amber-100'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>🔑 Status & Aktivasi Lisensi</span>
        </button>

        {profile.role === 'Super Admin' && (
          <button
            onClick={() => setActiveSubTab('management')}
            className={`px-5 py-3 font-black text-xs uppercase tracking-wider border-2 border-b-0 border-black rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'management'
                ? 'bg-emerald-500 text-white shadow-[3px_-3px_0px_#000]'
                : 'bg-white text-black hover:bg-amber-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>🛡️ Manajemen Akun (Super Admin)</span>
          </button>
        )}
      </div>

      {/* TAB 1: User Profile Form & Identity */}
      {activeSubTab === 'profile' && (
        <div className="p-6 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_#000] space-y-6">
          <div className="flex justify-between items-center pb-4 border-b-2 border-black/10">
            <div>
              <h2 className="text-lg font-black uppercase text-black">Informasi Profil Creator</h2>
              <p className="text-xs font-bold text-black/60">Kelola rincian identitas studio dan tampilan profil pengguna Anda.</p>
            </div>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer"
              >
                ✏️ Edit Profil
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer"
              >
                Batal
              </button>
            )}
          </div>

          {!isEditing ? (
            /* View Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-3.5 bg-[#FAF6ED] border-2 border-black rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-black/60">Nama Lengkap Creator:</span>
                  <p className="font-bold text-sm text-black">{profile.name}</p>
                </div>

                <div className="p-3.5 bg-[#FAF6ED] border-2 border-black rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-black/60">Username Studio:</span>
                  <p className="font-bold text-sm text-black font-mono">@{profile.username}</p>
                </div>

                <div className="p-3.5 bg-[#FAF6ED] border-2 border-black rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-black/60">Alamat Email Registered:</span>
                  <p className="font-bold text-sm text-black">{profile.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 bg-[#FAF6ED] border-2 border-black rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-black/60">Nama Studio / Organisasi:</span>
                  <p className="font-bold text-sm text-black">{profile.studioName}</p>
                </div>

                <div className="p-3.5 bg-[#FAF6ED] border-2 border-black rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-black/60">Bio / Deskripsi Studio:</span>
                  <p className="font-bold text-sm text-black">{profile.bio}</p>
                </div>

                <div className="p-3.5 bg-[#FAF6ED] border-2 border-black rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-black/60">Anggota Sejak:</span>
                  <p className="font-bold text-sm text-black flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Tahun {profile.memberSince || '2026'}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Form Mode */
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Avatar Selection Grid */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-black block">Pilih Foto Avatar Profile:</label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {presetAvatars.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt={`Avatar ${idx + 1}`}
                      onClick={() => setFormData({ ...formData, avatar: av })}
                      className={`w-14 h-14 rounded-xl border-2 border-black object-cover cursor-pointer transition-all ${
                        formData.avatar === av ? 'ring-4 ring-amber-400 scale-105 shadow-[3px_3px_0px_#000]' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-black">Nama Lengkap:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full neo-input text-xs font-bold p-2.5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-black">Username:</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="w-full neo-input text-xs font-mono font-bold p-2.5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-black">Alamat Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full neo-input text-xs font-bold p-2.5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-black">Nama Studio / Brand:</label>
                  <input
                    type="text"
                    value={formData.studioName}
                    onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                    className="w-full neo-input text-xs font-bold p-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black">Bio / Deskripsi Studio:</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full neo-input text-xs font-bold p-2.5"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-black rounded-lg font-black text-xs uppercase shadow-[3px_3px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: License Status & Activation */}
      {activeSubTab === 'license' && (
        <div className="p-6 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_#000] space-y-6">
          <div>
            <h2 className="text-lg font-black uppercase text-black">Status & Aktivasi Lisensi Aplikasi</h2>
            <p className="text-xs font-bold text-black/60">Aktifkan kunci lisensi Pro/VIP Anda untuk membuka seluruh fitur premium AudiraStudioMusic.</p>
          </div>

          {/* Active License Details Card */}
          <div className="p-5 bg-purple-50 border-2 border-black rounded-xl space-y-3 shadow-[3px_3px_0px_#000]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-700" />
                <span className="font-black text-sm uppercase text-purple-950">Lisensi Aktif Terdaftar</span>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-400 text-black font-black text-[10px] uppercase rounded border border-black">
                AKTIF (VIP FULL ACCESS)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-white p-3 rounded-lg border border-black text-xs space-y-1">
                <span className="text-[9px] font-black uppercase text-black/60">Tipe Lisensi:</span>
                <p className="font-black text-purple-700">AUDIRA v2.0 Enterprise VIP</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-black text-xs space-y-1">
                <span className="text-[9px] font-black uppercase text-black/60">Batas Slot Render Paralel:</span>
                <p className="font-black text-emerald-600 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> Unlimited (Multi-Thread GPU)
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-black text-xs space-y-1">
                <span className="text-[9px] font-black uppercase text-black/60">Masa Berlaku Lisensi:</span>
                <p className="font-black text-black">Seumur Hidup (Lifetime 2026+)</p>
              </div>
            </div>
          </div>

          {/* Activation Form */}
          <form onSubmit={handleActivateLicense} className="space-y-4 p-5 bg-[#FAF6ED] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
            <h3 className="font-black text-xs uppercase text-black flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-600" />
              <span>Aktivasi / Perbarui Kunci Lisensi Baru</span>
            </h3>

            <div className="flex gap-3 flex-col sm:flex-row">
              <input
                type="text"
                value={inputLicense}
                onChange={(e) => setInputLicense(e.target.value)}
                placeholder="Masukkan Kunci Lisensi (cth: AUDIRA-2026-VIP-9981)..."
                className="flex-1 neo-input text-xs font-mono font-bold p-3 uppercase"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white border-2 border-black rounded-xl font-black text-xs uppercase shadow-[3px_3px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer shrink-0"
              >
                Aktivasi Lisensi
              </button>
            </div>

            {licenseMsg && (
              <div className={`p-3 rounded-lg border-2 border-black font-bold text-xs ${
                licenseMsg.type === 'success' ? 'bg-emerald-100 text-emerald-950' : 'bg-red-100 text-red-950'
              }`}>
                {licenseMsg.text}
              </div>
            )}
          </form>
        </div>
      )}

      {/* TAB 3: Super Admin Account Management */}
      {activeSubTab === 'management' && profile.role === 'Super Admin' && (
        <div className="p-6 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_#000] space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black uppercase text-black flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Panel Manajemen Akun & Role Pengguna</span>
              </h2>
              <p className="text-xs font-bold text-black/60">Kelola hierarki role pengguna dan buat kunci lisensi baru untuk tim.</p>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-900 border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]">
              Super Admin Mode
            </span>
          </div>

          {/* License Key Generator Box */}
          <div className="p-5 bg-emerald-50 border-2 border-black rounded-xl space-y-4 shadow-[3px_3px_0px_#000]">
            <h3 className="font-black text-xs uppercase text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Generator Kunci Lisensi Sekali Klik</span>
            </h3>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-black">Target Role Lisensi:</span>
                <select
                  value={genRole}
                  onChange={(e) => setGenRole(e.target.value as any)}
                  className="bg-white border-2 border-black rounded p-2 font-bold text-xs shadow-[1.5px_1.5px_0px_#000]"
                >
                  <option value="Admin">Admin (Up to 5 Slots Render)</option>
                  <option value="User">Standard User (2 Slots Render)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerateKey}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Lisensi Baru</span>
              </button>
            </div>

            {generatedKey && (
              <div className="p-3 bg-white border-2 border-black rounded-lg flex items-center justify-between gap-3">
                <span className="font-mono font-black text-sm text-emerald-700">{generatedKey}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedKey)}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black border border-black rounded font-black text-xs uppercase flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Tersalin!' : 'Salin Kunci'}</span>
                </button>
              </div>
            )}
          </div>

          {/* User Accounts Table */}
          <div className="space-y-3">
            <h3 className="font-black text-xs uppercase text-black flex items-center gap-2">
              <Users className="w-4 h-4 text-black" />
              <span>Daftar Akun Terdaftar ({accountsList.length})</span>
            </h3>

            <div className="overflow-x-auto border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
              <table className="w-full text-left text-xs font-bold border-collapse">
                <thead>
                  <tr className="bg-amber-100 border-b-2 border-black text-black uppercase text-[10px] font-black">
                    <th className="p-3 border-r-2 border-black">Pengguna</th>
                    <th className="p-3 border-r-2 border-black">Email</th>
                    <th className="p-3 border-r-2 border-black">Role Saat Ini</th>
                    <th className="p-3 border-r-2 border-black">Ubah Role</th>
                    <th className="p-3">Status Akun</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10 bg-white">
                  {accountsList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-amber-50/50">
                      <td className="p-3 border-r-2 border-black font-black text-black">
                        {usr.name}
                      </td>
                      <td className="p-3 border-r-2 border-black text-black/70 font-mono">
                        {usr.email}
                      </td>
                      <td className="p-3 border-r-2 border-black">
                        <span className={`px-2.5 py-0.5 border border-black rounded text-[10px] font-black uppercase ${
                          usr.role === 'Super Admin' ? 'bg-purple-200 text-purple-900' :
                          usr.role === 'Admin' ? 'bg-blue-200 text-blue-900' : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="p-3 border-r-2 border-black">
                        <select
                          value={usr.role}
                          onChange={(e) => onUpdateUserRole(usr.id, e.target.value as any)}
                          className="bg-white border border-black rounded p-1 text-[11px] font-bold cursor-pointer"
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Admin">Admin</option>
                          <option value="User">User</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-black rounded text-[10px] font-black uppercase">
                          {usr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
