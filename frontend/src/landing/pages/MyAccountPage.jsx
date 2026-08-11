import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import { useToast } from "../../context/ToastContext";

import AccountLayout from "./my-account/AccountLayout";
import AddressModal from "./my-account/AddressModal";
import DashboardOverview from "./my-account/DashboardOverview";
import AccountDetailsPage from "./my-account/AccountDetailsPage";
import OrdersPage from "./my-account/OrdersPage";
import SavedPiecesPage from "./my-account/SavedPiecesPage";
import AddressesPage from "./my-account/AddressPage";
import MarketingPreferencesPage from "./my-account/MarketingPrefrencePage";
import { AVATARS } from "./my-account/AccountProfile";

const INITIAL_SAVED_PIECES = [
  {
    id: "p1",
    name: "Ivory Sozni Shawl",
    price: 42000,
    image: "/storefront/prod-1.png",
    category: "shawls",
    slug: "ivory-sozni-shawl",
  },
  {
    id: "p2",
    name: "Midnight Garden Shawl",
    price: 48000,
    image: "/storefront/prod-2.png",
    category: "shawls",
    slug: "midnight-garden-shawl",
  },
  {
    id: "p3",
    name: "Sand Pashmina Stole",
    price: 18000,
    image: "/storefront/cat-shawls.png",
    category: "stoles",
    slug: "sand-pashmina-stole",
  },
  {
    id: "p4",
    name: "Plain Pashmina Stole",
    price: 16000,
    image: "/storefront/cat-embroidered.png",
    category: "stoles",
    slug: "plain-pashmina-stole",
  },
];

export default function MyAccountPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("Overview");

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("zae_user_profile");
    return saved
      ? JSON.parse(saved)
      : {
          name: "Devyansh Grover",
          email: "devyansh.grover348@gmail.com",
          avatar: AVATARS[0],
          tagline: "Timeless pieces. Thoughtful choices.",
        };
  });

  const [savedPieces, setSavedPieces] = useState(() => {
    const saved = localStorage.getItem("zae_saved_pieces");
    return saved ? JSON.parse(saved) : INITIAL_SAVED_PIECES;
  });

  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem("zae_user_addresses");
    return saved ? JSON.parse(saved) : [];
  });

  const [marketingPreferences, setMarketingPreferences] = useState(() => {
    const saved = localStorage.getItem("zae_marketing_preferences");
    return saved ? JSON.parse(saved) : { emailUpdates: true };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
  });

  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    localStorage.setItem(
      "zae_marketing_preferences",
      JSON.stringify(marketingPreferences),
    );
  }, [marketingPreferences]);

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

  const handleToggleHeart = (productId, productName) => {
    setSavedPieces((prev) => {
      const exists = prev.some((item) => item.id === productId);
      if (exists) {
        toast(`Removed "${productName}" from saved pieces`, "info");
        return prev.filter((item) => item.id !== productId);
      }
      return prev;
    });
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (
      !addressForm.addressLine ||
      !addressForm.city ||
      !addressForm.postalCode
    ) {
      toast("Please fill in required address fields", "error");
      return;
    }
    setAddresses([...addresses, { id: "addr_" + Date.now(), ...addressForm }]);
    setShowAddressModal(false);
    setAddressForm({
      label: "Home",
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
    });
    toast("New address added", "success");
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
    toast("Address removed", "info");
  };

  const handleToggleMarketing = () => {
    const updated = { emailUpdates: !marketingPreferences.emailUpdates };
    setMarketingPreferences(updated);
    toast(
      updated.emailUpdates
        ? "Subscribed to email updates"
        : "Unsubscribed from email updates",
      "info",
    );
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <DashboardOverview
            profile={profile}
            showAvatarSelector={showAvatarSelector}
            setShowAvatarSelector={setShowAvatarSelector}
            onAvatarChange={handleAvatarChange}
            onAddAddress={() => setShowAddressModal(true)}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editForm={editForm}
            setEditForm={setEditForm}
            onProfileSave={handleProfileSave}
            savedPieces={savedPieces}
            onToggleHeart={handleToggleHeart}
            addresses={addresses}
            onDeleteAddress={handleDeleteAddress}
            marketingPreferences={marketingPreferences}
            onToggleMarketing={handleToggleMarketing}
            setActiveTab={setActiveTab}
            setShowAddressModal={setShowAddressModal}
          />
        );
      case "Orders":
        return <OrdersPage />;
      case "Saved Pieces":
        return (
          <SavedPiecesPage
            savedPieces={savedPieces}
            onToggleHeart={handleToggleHeart}
          />
        );
      case "Addresses":
        return (
          <AddressesPage
            profile={profile}
            addresses={addresses}
            onDeleteAddress={handleDeleteAddress}
            onAddAddress={() => setShowAddressModal(true)}
          />
        );
      case "Account Details":
        return (
          <AccountDetailsPage
            profile={profile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editForm={editForm}
            setEditForm={setEditForm}
            onProfileSave={handleProfileSave}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        );
      case "Marketing Preferences":
        return (
          <MarketingPreferencesPage
            marketingPreferences={marketingPreferences}
            onToggleMarketing={handleToggleMarketing}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#FAF8F5] text-[#1C1916] font-sans min-h-screen flex flex-col justify-between overflow-x-hidden">
      <AccountLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navigate={navigate}
        toast={toast}
      >
        {renderActivePage()}
      </AccountLayout>

      <div>
        <SiteFooter />
      </div>

      <AddressModal
        show={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        addressForm={addressForm}
        setAddressForm={setAddressForm}
        onSubmit={handleAddressSubmit}
      />
    </div>
  );
}
