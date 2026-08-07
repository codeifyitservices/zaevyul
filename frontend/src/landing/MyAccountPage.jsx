import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Bookmark, 
  Bell, 
  MoreHorizontal, 
  Plus, 
  Heart, 
  MapPin, 
  Mail, 
  User, 
  Lock, 
  Edit3, 
  Trash2, 
  ArrowRight,
  Sparkles,
  Check,
  Eye,
  EyeOff
} from "lucide-react";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";
import { useToast } from "../context/ToastContext";

// Predefined luxury Kashmiri avatars the user can choose from
const AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
];

const INITIAL_SAVED_PIECES = [
  {
    id: "p1",
    name: "Ivory Sozni Shawl",
    price: 42000,
    image: "/storefront/prod-1.png",
    category: "shawls",
    slug: "ivory-sozni-shawl"
  },
  {
    id: "p2",
    name: "Midnight Garden Shawl",
    price: 48000,
    image: "/storefront/prod-2.png",
    category: "shawls",
    slug: "midnight-garden-shawl"
  },
  {
    id: "p3",
    name: "Sand Pashmina Stole",
    price: 18000,
    image: "/storefront/cat-shawls.png",
    category: "stoles",
    slug: "sand-pashmina-stole"
  },
  {
    id: "p4",
    name: "Plain Pashmina Stole",
    price: 16000,
    image: "/storefront/cat-embroidered.png",
    category: "stoles",
    slug: "plain-pashmina-stole"
  }
];

export default function MyAccountPage() {
  const navigate = useNavigate();
  const toast = useToast();

  // Tab State
  const [activeTab, setActiveTab] = useState("Overview");

  // User Profile State
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("zae_user_profile");
    return saved ? JSON.parse(saved) : {
      name: "Devyansh Grover",
      email: "devyansh.grover348@gmail.com",
      avatar: AVATARS[0],
      tagline: "Timeless pieces. Thoughtful choices."
    };
  });

  // Saved Pieces State
  const [savedPieces, setSavedPieces] = useState(() => {
    const saved = localStorage.getItem("zae_saved_pieces");
    return saved ? JSON.parse(saved) : INITIAL_SAVED_PIECES;
  });

  // Addresses State
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem("zae_user_addresses");
    return saved ? JSON.parse(saved) : [];
  });

  // Marketing Preference State
  const [marketingPreferences, setMarketingPreferences] = useState(() => {
    const saved = localStorage.getItem("zae_marketing_preferences");
    return saved ? JSON.parse(saved) : { emailUpdates: true };
  });

  // Edit Account Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    phone: ""
  });

  // Avatar Edit State
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem("zae_user_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("zae_saved_pieces", JSON.stringify(savedPieces));
  }, [savedPieces]);

  useEffect(() => {
    localStorage.setItem("zae_user_addresses", JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem("zae_marketing_preferences", JSON.stringify(marketingPreferences));
  }, [marketingPreferences]);

  // Edit Handlers
  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) {
      toast("Name and email are required", "error");
      return;
    }
    setProfile({ ...profile, name: editForm.name, email: editForm.email });
    setIsEditing(false);
    toast("Profile updated successfully", "success");
  };

  const handleAvatarChange = (avatarUrl) => {
    setProfile({ ...profile, avatar: avatarUrl });
    setShowAvatarSelector(false);
    toast("Profile avatar updated", "success");
  };

  // Heart toggle handler
  const handleToggleHeart = (productId, productName) => {
    setSavedPieces((prev) => {
      const exists = prev.some(item => item.id === productId);
      if (exists) {
        toast(`Removed "${productName}" from saved pieces`, "info");
        return prev.filter(item => item.id !== productId);
      }
      return prev;
    });
  };

  // Address Handlers
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!addressForm.addressLine || !addressForm.city || !addressForm.postalCode) {
      toast("Please fill in required address fields", "error");
      return;
    }
    const newAddress = {
      id: "addr_" + Date.now(),
      ...addressForm
    };
    setAddresses([...addresses, newAddress]);
    setShowAddressModal(false);
    setAddressForm({
      label: "Home",
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
      phone: ""
    });
    toast("New address added", "success");
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
    toast("Address removed", "info");
  };

  const handleToggleMarketing = () => {
    const updated = { emailUpdates: !marketingPreferences.emailUpdates };
    setMarketingPreferences(updated);
    toast(
      updated.emailUpdates 
        ? "Subscribed to email updates" 
        : "Unsubscribed from email updates", 
      "info"
    );
  };

  return (
    <div className="bg-[#FAF8F5] text-[#1C1916] font-sans min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* Standard Site Navbar */}
      <Navbar />

      {/* Main Container with top padding to clear fixed navbar */}
      <main className="flex-1 pt-[68px]">

        {/* Dedicated Account Sub-header */}
        <div className="border-b border-[#E6DED4]/60 bg-[#FAF8F5]">
          <div className="mx-auto max-w-[1250px] w-full px-6 sm:px-10 lg:px-14 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Back Button */}
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-[10px] font-semibold tracking-[0.25em] uppercase text-[#1C1916]/70 hover:text-[#1C1916] cursor-pointer transition-colors duration-200"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span> MY ACCOUNT
            </button>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 md:justify-center">
              {["Overview", "Orders", "Saved Pieces", "Addresses", "Account Details", "Marketing Preferences"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-[11.5px] font-medium tracking-wide transition-all duration-200 cursor-pointer
                      ${isActive 
                        ? "bg-[#F5EFE7] text-[#1C1916] shadow-xs" 
                        : "text-[#8A857E] hover:text-[#1C1916]"
                      }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Sub-header Icons */}
            <div className="hidden lg:flex items-center gap-5 text-[#1C1916]/70">
              <button 
                onClick={() => toast("Bookmark capability integrated", "success")}
                className="hover:text-[#1C1916] cursor-pointer transition-colors"
                aria-label="Bookmark Account"
              >
                <Bookmark size={15} strokeWidth={1.4} />
              </button>
              <button 
                onClick={() => toast("No new account alerts", "info")}
                className="hover:text-[#1C1916] cursor-pointer transition-colors"
                aria-label="Notifications"
              >
                <Bell size={15} strokeWidth={1.4} />
              </button>
              <button 
                onClick={() => toast("More options menu", "success")}
                className="hover:text-[#1C1916] cursor-pointer transition-colors"
                aria-label="Options"
              >
                <MoreHorizontal size={15} strokeWidth={1.4} />
              </button>
            </div>

          </div>
        </div>

        {/* Dashboard Grid Container */}
        <div className="mx-auto max-w-[1250px] w-full px-6 sm:px-10 lg:px-14 py-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
            
            {/* Left Profile Panel (1 Column Span) */}
            <div className="lg:col-span-1 flex flex-col items-center text-center bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 sm:p-8 shadow-xs">
              
              {/* Profile Image & Avatar Changer */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#E6DED4] bg-[#FAF8F5] shadow-xs">
                  <img 
                    src={profile.avatar} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="absolute bottom-0.5 right-0.5 bg-white border border-[#E6DED4] p-2 rounded-full shadow-md hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  aria-label="Change profile picture"
                >
                  <Edit3 size={12} className="text-[#6B6560]" />
                </button>

                {/* Avatar selection popup */}
                {showAvatarSelector && (
                  <div className="absolute top-36 left-1/2 -translate-x-1/2 z-20 bg-white border border-[#E6DED4] rounded-lg shadow-xl p-3 flex gap-2 animate-in fade-in zoom-in-95 duration-150">
                    {AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAvatarChange(url)}
                        className="w-10 h-10 rounded-full overflow-hidden border border-[#E6DED4] hover:border-[#B58A5B] transition-colors cursor-pointer"
                      >
                        <img src={url} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Metadata */}
              <h2 className="font-serif text-[22px] font-normal tracking-wide text-[#1C1916] mt-5 leading-snug">
                {profile.name}
              </h2>
              <p className="font-sans text-[11px] text-[#8A857E] mt-1 font-light tracking-wide uppercase">
                {profile.tagline}
              </p>

              <button
                onClick={() => setShowAddressModal(true)}
                className="w-full mt-8 border border-[#E6DED4] text-[#1C1916] hover:bg-[#1C1916] hover:text-white hover:border-[#1C1916] transition-colors duration-300 py-3 text-[10px] font-semibold tracking-[0.2em] uppercase rounded-[2px] cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus size={12} /> New Address
              </button>

            </div>

            {/* Right Dashboard Content (3 Column Span) */}
            <div className="lg:col-span-3 space-y-10">

              {/* VIEW 1: OVERVIEW TAB */}
              {(activeTab === "Overview" || activeTab === "Account Details") && (
                <div className="bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 sm:p-8 shadow-xs relative">
                  
                  <div className="flex items-center justify-between border-b border-[#E6DED4]/60 pb-4 mb-6">
                    <h3 className="font-serif text-[18px] font-normal tracking-wide text-[#1C1916]">
                      Account Details
                    </h3>
                    {!isEditing && (
                      <button 
                        onClick={() => {
                          setEditForm({ ...profile });
                          setIsEditing(true);
                        }}
                        className="p-1.5 text-[#8A857E] hover:text-[#B58A5B] transition-colors cursor-pointer"
                        aria-label="Edit account details"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    /* Profile Edit Form */
                    <form onSubmit={handleProfileSave} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-[#E6DED4] text-[10px] font-semibold tracking-wider uppercase rounded-[2px] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#1C1916] hover:bg-[#B58A5B] text-white text-[10px] font-semibold tracking-wider uppercase rounded-[2px] transition-colors cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Display Details */
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-1 py-1">
                        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#8A857E]">
                          Name
                        </span>
                        <span className="font-sans text-[13.5px] font-normal text-[#1C1916] md:col-span-3">
                          {profile.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-1 py-1 border-t border-[#E6DED4]/20 pt-4">
                        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#8A857E]">
                          Email
                        </span>
                        <span className="font-sans text-[13.5px] font-normal text-[#1C1916] md:col-span-3">
                          {profile.email}
                        </span>
                      </div>
                      {activeTab === "Account Details" && (
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1 py-1 border-t border-[#E6DED4]/20 pt-4">
                          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#8A857E]">
                            Password
                          </span>
                          <div className="md:col-span-3 flex items-center justify-between">
                            <span className="font-sans text-[13.5px] font-normal text-[#1C1916] tracking-widest">
                              {showPassword ? "ZaevyulPass123" : "••••••••"}
                            </span>
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-xs text-[#8A857E] hover:text-[#1C1916] cursor-pointer transition-colors p-1"
                            >
                              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* VIEW 2: LATEST ORDERS TAB */}
              {(activeTab === "Overview" || activeTab === "Orders") && (
                <div className="bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 sm:p-8 shadow-xs">
                  
                  <div className="flex items-center justify-between border-b border-[#E6DED4]/60 pb-4 mb-6">
                    <h3 className="font-serif text-[18px] font-normal tracking-wide text-[#1C1916] flex items-center gap-2.5">
                      <Sparkles size={16} className="text-[#B58A5B]" /> Latest Orders
                    </h3>
                    <button
                      onClick={() => toast("Redirecting to heritage catalogue", "info")}
                      className="text-[#8A857E] hover:text-[#1C1916] cursor-pointer transition-colors text-lg p-1 -mr-1"
                      aria-label="Create Order"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#FBF9F6] border border-[#E6DED4]/40 flex items-center justify-center text-[#8A857E] mb-4">
                      <Mail size={18} strokeWidth={1.5} />
                    </div>
                    <p className="font-serif text-[15px] font-light text-[#1C1916] mb-1">
                      You have no orders yet.
                    </p>
                    <p className="font-sans text-[12.5px] text-[#8A857E] font-light mb-5">
                      Explore our handwoven, curated heritage pieces.
                    </p>
                    <Link
                      to="/collections"
                      className="group inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.2em] uppercase text-[#1C1916] hover:text-[#B58A5B] transition-colors duration-200 cursor-pointer"
                    >
                      Explore Collection <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>

                </div>
              )}

              {/* VIEW 3: SAVED PIECES TAB */}
              {(activeTab === "Overview" || activeTab === "Saved Pieces") && (
                <div className="bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 sm:p-8 shadow-xs">
                  
                  <div className="flex items-center justify-between border-b border-[#E6DED4]/60 pb-4 mb-6">
                    <h3 className="font-serif text-[18px] font-normal tracking-wide text-[#1C1916] flex items-center gap-2.5">
                      <Heart size={16} className="text-[#B58A5B]" /> Saved Pieces
                    </h3>
                    <Link
                      to="/collections"
                      className="group inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-[#8A857E] hover:text-[#1C1916] transition-colors duration-200 cursor-pointer"
                    >
                      View all <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>

                  {savedPieces.length === 0 ? (
                    <div className="py-12 text-center text-[#8A857E] font-sans text-xs">
                      No saved pieces yet. Browse items and click heart icon to save.
                    </div>
                  ) : (
                    /* Grid of Saved Pieces */
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {savedPieces.map((p) => (
                        <div key={p.id} className="group relative flex flex-col">
                          
                          {/* Image container */}
                          <div className="relative aspect-[4/5] rounded-[2px] bg-[#EFE9E1] overflow-hidden border border-[#E6DED4]/30 shadow-xs">
                            <img 
                              src={p.image} 
                              alt={p.name} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                            />
                            
                            {/* Unsave Heart Overlay Button */}
                            <button
                              onClick={() => handleToggleHeart(p.id, p.name)}
                              className="absolute top-2.5 right-2.5 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-[#B58A5B] hover:text-[#C94C4C] transition-all cursor-pointer"
                              aria-label="Remove from saved"
                            >
                              <Heart size={12} fill="#B58A5B" strokeWidth={0} />
                            </button>
                          </div>

                          {/* Product Info */}
                          <h4 className="font-sans text-[12px] font-medium text-[#1C1916] mt-3 leading-tight truncate">
                            {p.name}
                          </h4>
                          <span className="font-sans text-[11px] text-[#6B6560] mt-1 font-light">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* VIEW 4: BOTTOM THREE COLUMNS OR SPECIFIC SECTIONS */}
              {activeTab === "Overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1: Addresses */}
                  <div className="bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#E6DED4]/60 pb-3.5 mb-4">
                        <h4 className="font-serif text-[15px] font-normal tracking-wide text-[#1C1916] flex items-center gap-2">
                          <MapPin size={13} className="text-[#B58A5B]" /> Addresses
                        </h4>
                        <button 
                          onClick={() => setShowAddressModal(true)}
                          className="text-[#8A857E] hover:text-[#1C1916] text-sm cursor-pointer p-0.5"
                          aria-label="Add Address"
                        >
                          +
                        </button>
                      </div>

                      {addresses.length === 0 ? (
                        <p className="font-sans text-[11.5px] text-[#8A857E] leading-relaxed mb-4 font-light">
                          No saved addresses. Add a delivery address for faster checkout.
                        </p>
                      ) : (
                        <div className="space-y-3 mb-4">
                          {addresses.map((addr) => (
                            <div key={addr.id} className="text-[11.5px] font-sans font-light bg-[#FBF9F6] border border-[#E6DED4]/30 p-2.5 rounded-[2px] relative group">
                              <span className="font-semibold block mb-0.5 text-[#1C1916] uppercase text-[9px] tracking-wider text-[#B58A5B]">{addr.label}</span>
                              <p className="text-[#1C1916]">{addr.addressLine}</p>
                              <p className="text-[#6B6560]">{addr.city}, {addr.postalCode}</p>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="absolute right-2.5 top-2.5 text-[#8A857E] hover:text-[#C94C4C] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                                aria-label="Delete address"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        if (addresses.length > 0) {
                          toast("Editing addresses is available in full settings", "info");
                        } else {
                          setShowAddressModal(true);
                        }
                      }}
                      className="group flex items-center gap-1.5 text-[9.5px] font-semibold tracking-[0.2em] uppercase text-[#1C1916] hover:text-[#B58A5B] transition-colors duration-200 cursor-pointer pt-3 mt-auto"
                    >
                      {addresses.length > 0 ? "Edit Addresses" : "Add Address"} <ArrowRight size={10} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                  </div>

                  {/* Card 2: Account Details Quickview */}
                  <div className="bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#E6DED4]/60 pb-3.5 mb-4">
                        <h4 className="font-serif text-[15px] font-normal tracking-wide text-[#1C1916] flex items-center gap-2">
                          <User size={13} className="text-[#B58A5B]" /> Account Details
                        </h4>
                        <button 
                          onClick={() => {
                            setEditForm({ ...profile });
                            setIsEditing(true);
                          }}
                          className="text-[#8A857E] hover:text-[#B58A5B] cursor-pointer p-0.5"
                          aria-label="Edit Profile"
                        >
                          <Edit3 size={11} />
                        </button>
                      </div>

                      <div className="space-y-2.5 text-[11.5px] font-sans font-light">
                        <div>
                          <span className="block text-[9px] font-semibold text-[#8A857E] uppercase tracking-wider mb-0.5">Name</span>
                          <span className="text-[#1C1916]">{profile.name}</span>
                        </div>
                        <div className="pt-1.5 border-t border-[#E6DED4]/15">
                          <span className="block text-[9px] font-semibold text-[#8A857E] uppercase tracking-wider mb-0.5">Email</span>
                          <span className="text-[#1C1916] truncate block">{profile.email}</span>
                        </div>
                        <div className="pt-1.5 border-t border-[#E6DED4]/15">
                          <span className="block text-[9px] font-semibold text-[#8A857E] uppercase tracking-wider mb-0.5">Password</span>
                          <span className="text-[#1C1916]">••••••••</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("Account Details")}
                      className="group flex items-center gap-1.5 text-[9.5px] font-semibold tracking-[0.2em] uppercase text-[#1C1916] hover:text-[#B58A5B] transition-colors duration-200 cursor-pointer pt-3 mt-auto"
                    >
                      Full Details <ArrowRight size={10} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                  </div>

                  {/* Card 3: Marketing Preferences */}
                  <div className="bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#E6DED4]/60 pb-3.5 mb-4">
                        <h4 className="font-serif text-[15px] font-normal tracking-wide text-[#1C1916] flex items-center gap-2">
                          <Mail size={13} className="text-[#B58A5B]" /> Marketing Preferences
                        </h4>
                      </div>

                      <div className="text-[11.5px] font-sans font-light space-y-4">
                        <p className="text-[#8A857E] leading-relaxed">
                          Choose how you'd like to stay connected and receive luxury updates.
                        </p>
                        
                        {/* Switch Toggle */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="font-semibold text-[#1C1916] text-[12px]">Email Updates</span>
                          <button
                            onClick={handleToggleMarketing}
                            className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                              ${marketingPreferences.emailUpdates ? "bg-[#B58A5B]" : "bg-[#E6DED4]"}`}
                            role="switch"
                            aria-checked={marketingPreferences.emailUpdates}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out
                                ${marketingPreferences.emailUpdates ? "translate-x-4.5" : "translate-x-0"}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("Marketing Preferences")}
                      className="group flex items-center gap-1.5 text-[9.5px] font-semibold tracking-[0.2em] uppercase text-[#1C1916] hover:text-[#B58A5B] transition-colors duration-200 cursor-pointer pt-3 mt-auto"
                    >
                      Preferences <ArrowRight size={10} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                  </div>

                </div>
              )}

              {/* INDIVIDUAL TAB VIEWS (FILTERED DISPLAY) */}
              {activeTab === "Addresses" && (
                <div className="bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 sm:p-8 shadow-xs">
                  
                  <div className="flex items-center justify-between border-b border-[#E6DED4]/60 pb-4 mb-6">
                    <h3 className="font-serif text-[18px] font-normal tracking-wide text-[#1C1916] flex items-center gap-2.5">
                      <MapPin size={16} className="text-[#B58A5B]" /> Saved Addresses
                    </h3>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="text-[10px] font-semibold tracking-wider uppercase text-[#B58A5B] hover:text-[#1C1916] transition-colors cursor-pointer"
                    >
                      + Add Address
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="py-12 text-center text-[#8A857E] font-sans text-xs">
                      No saved addresses yet. Click above to add an address.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="p-4 border border-[#E6DED4]/60 rounded-[2px] bg-[#FBF9F6] relative group">
                          <span className="font-sans text-[10px] font-bold text-[#B58A5B] tracking-wider uppercase">{addr.label}</span>
                          <div className="mt-2 text-xs font-sans font-light space-y-1 text-[#1C1916]">
                            <p className="font-medium text-[#1C1916]">{profile.name}</p>
                            <p>{addr.addressLine}</p>
                            <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                            {addr.phone && <p className="text-[#8A857E] mt-1.5">Tel: {addr.phone}</p>}
                          </div>
                          
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="absolute right-3.5 top-3.5 text-[#8A857E] hover:text-[#C94C4C] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                            aria-label="Delete address"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {activeTab === "Marketing Preferences" && (
                <div className="bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 sm:p-8 shadow-xs">
                  
                  <div className="border-b border-[#E6DED4]/60 pb-4 mb-6">
                    <h3 className="font-serif text-[18px] font-normal tracking-wide text-[#1C1916] flex items-center gap-2.5">
                      <Mail size={16} className="text-[#B58A5B]" /> Marketing Preferences
                    </h3>
                  </div>

                  <div className="space-y-6 max-w-lg">
                    <p className="font-sans text-[13px] font-light text-[#8A857E] leading-relaxed">
                      Control the updates you wish to receive from the Zaevyul house of luxury. We send updates about new collections, seasonal launches, and invite-only artisan events.
                    </p>

                    <div className="flex items-center justify-between bg-[#FBF9F6] border border-[#E6DED4]/40 p-5 rounded-[4px]">
                      <div>
                        <h4 className="font-sans text-[13.5px] font-semibold text-[#1C1916]">
                          Email Updates
                        </h4>
                        <p className="font-sans text-[11.5px] text-[#8A857E] mt-0.5 font-light">
                          Receive emails about heritage collections, private events, and news.
                        </p>
                      </div>
                      <button
                        onClick={handleToggleMarketing}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                          ${marketingPreferences.emailUpdates ? "bg-[#B58A5B]" : "bg-[#E6DED4]"}`}
                        role="switch"
                        aria-checked={marketingPreferences.emailUpdates}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out
                            ${marketingPreferences.emailUpdates ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      {/* Standard Site Footer */}
      <SiteFooter />

      {/* Address Form Popup Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowAddressModal(false)}
            className="fixed inset-0 bg-[#1C1916]/45 backdrop-blur-[4px] cursor-pointer"
          />

          <div className="relative z-10 w-full max-w-[450px] bg-[#FAF8F5] border border-[#E6DED4] rounded-lg shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute right-4 top-4 text-[#8A857E] hover:text-[#1C1916] cursor-pointer text-xl font-light p-1"
            >
              ✕
            </button>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <h3 className="font-serif text-[20px] font-normal tracking-wide text-[#1C1916] mb-4">
                Add New Address
              </h3>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                  Address Tag (e.g. Home, Office)
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  placeholder="e.g. Home"
                  className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                  placeholder="House number, apartment number, street details"
                  className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="Srinagar"
                    className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                    State / UT
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="Jammu & Kashmir"
                    className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    placeholder="190001"
                    className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder="9900000000"
                    className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-[#1C1916] text-white py-4 font-sans text-[10.5px] font-semibold uppercase tracking-[0.2em] rounded-[2px] hover:bg-[#B58A5B] transition-colors duration-200 cursor-pointer"
              >
                Add Address
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
