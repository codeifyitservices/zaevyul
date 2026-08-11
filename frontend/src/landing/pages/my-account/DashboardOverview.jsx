import { useState } from "react";
import {
  List,
  Heart,
  MapPin,
  User,
  Mail,
  Edit3,
  Trash2,
  Plus,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

/**
 * PREVIEW-ONLY FILE — for viewing in this chat's artifact renderer.
 * Do NOT copy this into your project. Your production file is
 * DashboardOverview.jsx (bracket Tailwind classes + react-router-dom Link),
 * which is correct for a real Tailwind build and untouched by this file.
 *
 * This copy exists only because the chat preview here has no Tailwind
 * JIT compiler, so bracket values like bg-[#EEE8E0] don't render — this
 * version uses inline styles instead, purely so you can see the layout.
 */

const C = {
  border: "#EEE8E0",
  borderLight: "#F0ECE7",
  ink: "#161411",
  inkStrong: "#1C1916",
  textMuted: "#6B6560",
  textFaint: "#8D8780",
  textFainter: "#8A857E",
  accent: "#9D7E59",
  hoverBg: "#FBF9F6",
  hoverBg2: "#F3EFE9",
  iconBg: "#F4F1EC",
  avatarBg: "#EFE9E1",
  toggleOff: "#E6DED4",
  danger: "#C94C4C",
  labelName: "#5F5A54",
  avatarEditBorder: "#E9E2DA",
  avatarOptBorder: "#E6DED4",
};

const AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
];

const DEMO_PROFILE = {
  name: "Devyansh Grover",
  email: "devyansh.grover348@gmail.com",
  tagline: "Timeless pieces. Thoughtful choices.",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
};

const DEMO_SAVED_PIECES = [
  {
    id: 1,
    name: "Ivory Sozni Shawl",
    price: 42000,
    image:
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 2,
    name: "Midnight Garden Shawl",
    price: 46000,
    image:
      "https://images.unsplash.com/photo-1610030181087-540f3116e3aa?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 3,
    name: "Sand Pashmina Stole",
    price: 18000,
    image:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 4,
    name: "Plain Pashmina Stole",
    price: 16000,
    image:
      "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?auto=format&fit=crop&q=80&w=400",
  },
];

function DashboardOverviewPreview({
  profile = DEMO_PROFILE,
  savedPieces: initialSaved = DEMO_SAVED_PIECES,
  addresses: initialAddresses = [],
  marketingPreferences: marketingPreferencesProp,
  onToggleMarketing: onToggleMarketingProp,
}) {
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [savedPieces, setSavedPieces] = useState(initialSaved);
  const [addresses] = useState(initialAddresses);
  const [localMarketingPreferences, setLocalMarketingPreferences] = useState({
    emailUpdates: true,
  });

  const onToggleHeart = (id) =>
    setSavedPieces((prev) => prev.filter((p) => p.id !== id));
  const marketingPreferences =
    marketingPreferencesProp || localMarketingPreferences;
  const onToggleMarketing =
    onToggleMarketingProp ||
    (() =>
      setLocalMarketingPreferences((prev) => ({
        ...prev,
        emailUpdates: !prev.emailUpdates,
      })));

  return (
    <div
      style={{
        margin: "0 auto",
        padding: "40px 24px",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "250px minmax(0,1fr)",
          alignItems: "start",
          gap: 56,
        }}
      >
        {/* LEFT COLUMN */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            paddingTop: 8,
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                height: 142,
                width: 142,
                overflow: "hidden",
                borderRadius: "9999px",
                background: C.avatarBg,
              }}
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                style={{ height: "100%", width: "100%", objectFit: "cover" }}
              />
            </div>
            <button
              onClick={() => setShowAvatarSelector(!showAvatarSelector)}
              aria-label="Change profile picture"
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 28,
                width: 28,
                borderRadius: "9999px",
                border: `1px solid ${C.avatarEditBorder}`,
                background: "#fff",
                color: C.textMuted,
                boxShadow: "0 6px 18px rgba(28,25,22,0.08)",
                cursor: "pointer",
              }}
            >
              <Edit3 size={12} strokeWidth={1.45} />
            </button>
            {showAvatarSelector && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 156,
                  zIndex: 20,
                  display: "flex",
                  gap: 8,
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  background: "#fff",
                  padding: 12,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                }}
              >
                {AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    style={{
                      height: 36,
                      width: 36,
                      overflow: "hidden",
                      borderRadius: "9999px",
                      border: `1px solid ${C.avatarOptBorder}`,
                      cursor: "pointer",
                      padding: 0,
                      background: "none",
                    }}
                  >
                    <img
                      src={url}
                      alt=""
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <h2
            style={{
              marginTop: 28,
              fontSize: 25,
              fontFamily: "Georgia, serif",
              color: C.ink,
            }}
          >
            {profile.name}
          </h2>
          <p
            style={{
              marginTop: 8,
              fontSize: 12,
              fontWeight: 300,
              color: C.textFaint,
            }}
          >
            {profile.tagline}
          </p>

          <button
            style={{
              marginTop: 32,
              display: "inline-flex",
              height: 40,
              minWidth: 126,
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              borderRadius: 4,
              border: `1px solid ${C.border}`,
              background: "#fff",
              padding: "0 20px",
              fontSize: 11,
              fontWeight: 500,
              color: C.inkStrong,
              cursor: "pointer",
            }}
          >
            <Plus size={14} strokeWidth={1.55} /> New Address
          </button>
        </div>

        {/* RIGHT COLUMN */}
        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <section
            style={{
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: "#fdfefd",
              padding: "24px 28px",
            }}
          >
            <div
              style={{
                marginBottom: 28,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <h3
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 17,
                  color: C.ink,
                  margin: 0,
                }}
              >
                Account Details
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: "flex",
                  height: 28,
                  width: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9999px",
                  background: C.hoverBg,
                  color: C.textMuted,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Edit3 size={12} strokeWidth={1.45} />
              </button>
            </div>
            <div style={{ fontSize: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "180px 1fr",
                  borderBottom: `1px solid ${C.borderLight}`,
                  paddingBottom: 16,
                }}
              >
                <span style={{ color: C.labelName }}>Name</span>
                <span style={{ color: C.ink }}>{profile.name}</span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "180px 1fr",
                  paddingTop: 16,
                }}
              >
                <span style={{ color: C.labelName }}>Email</span>
                <span style={{ color: C.ink }}>{profile.email}</span>
              </div>
            </div>
          </section>

          <section>
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontFamily: "Georgia, serif",
                  fontSize: 17,
                  color: C.ink,
                  margin: 0,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    height: 20,
                    width: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 4,
                    background: C.iconBg,
                    color: C.textMuted,
                  }}
                >
                  <List size={12} strokeWidth={1.4} />
                </span>
                Latest Orders
              </h3>
              <button
                style={{
                  display: "flex",
                  height: 28,
                  width: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9999px",
                  background: C.hoverBg,
                  color: C.textMuted,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Plus size={14} strokeWidth={1.55} />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                minHeight: 82,
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: "#fff",
                padding: "16px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    display: "flex",
                    height: 44,
                    width: 44,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "9999px",
                    background: C.iconBg,
                    color: C.accent,
                  }}
                >
                  <ShoppingBag size={18} strokeWidth={1.45} />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 500,
                      color: C.ink,
                    }}
                  >
                    You have no orders yet.
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      fontWeight: 300,
                      color: C.textFaint,
                    }}
                  >
                    Explore our handcrafted pieces.
                  </p>
                </div>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 11,
                  fontWeight: 500,
                  color: C.ink,
                }}
              >
                Explore Collection <ArrowRight size={14} strokeWidth={1.45} />
              </span>
            </div>
          </section>

          <section>
            <div
              style={{
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontFamily: "Georgia, serif",
                  fontSize: 17,
                  color: C.ink,
                  margin: 0,
                }}
              >
                <Heart size={17} strokeWidth={1.35} color={C.ink} /> Saved
                Pieces
              </h3>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 11,
                  fontWeight: 500,
                  color: C.ink,
                }}
              >
                View all <ArrowRight size={14} strokeWidth={1.45} />
              </span>
            </div>
            {savedPieces.length === 0 ? (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  fontSize: 12,
                  color: C.textFainter,
                }}
              >
                No saved pieces yet. Browse items and click heart icon to save.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 24,
                }}
              >
                {savedPieces.map((p) => (
                  <div
                    key={p.id}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <div
                      style={{
                        position: "relative",
                        aspectRatio: "1.62",
                        overflow: "hidden",
                        borderRadius: 7,
                        background: C.avatarBg,
                      }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        onClick={() => onToggleHeart(p.id)}
                        aria-label="Remove from saved"
                        style={{
                          position: "absolute",
                          right: 12,
                          top: 12,
                          display: "flex",
                          height: 28,
                          width: 28,
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "9999px",
                          background: "rgba(255,255,255,0.95)",
                          color: C.textMuted,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Heart size={15} strokeWidth={1.45} />
                      </button>
                    </div>
                    <h4
                      style={{
                        marginTop: 12,
                        fontSize: 11,
                        fontWeight: 500,
                        color: C.ink,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.name}
                    </h4>
                    <span
                      style={{
                        marginTop: 4,
                        fontSize: 10.5,
                        fontWeight: 500,
                        color: C.ink,
                      }}
                    >
                      &#8377; {p.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
            }}
          >
            <section
              style={{
                display: "flex",
                minHeight: 162,
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: "#fff",
                padding: "20px 24px",
              }}
            >
              <div>
                <div
                  style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <h4
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontFamily: "Georgia, serif",
                      fontSize: 16,
                      color: C.ink,
                      margin: 0,
                    }}
                  >
                    <MapPin size={16} strokeWidth={1.35} color={C.ink} />{" "}
                    Addresses
                  </h4>
                  <button
                    style={{
                      display: "flex",
                      height: 28,
                      width: 28,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "9999px",
                      background: C.hoverBg,
                      color: C.textMuted,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={14} strokeWidth={1.55} />
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <p
                    style={{
                      marginBottom: 16,
                      fontSize: 11,
                      fontWeight: 300,
                      lineHeight: 1.6,
                      color: C.textFaint,
                    }}
                  >
                    No saved addresses.
                    <br />
                    Add a delivery address for faster checkout.
                  </p>
                ) : null}
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 11,
                  fontWeight: 500,
                  color: C.ink,
                }}
              >
                Add Address <ArrowRight size={14} strokeWidth={1.45} />
              </span>
            </section>

            <section
              style={{
                display: "flex",
                minHeight: 162,
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: "#fff",
                padding: "20px 24px",
              }}
            >
              <div>
                <div
                  style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <h4
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontFamily: "Georgia, serif",
                      fontSize: 16,
                      color: C.ink,
                      margin: 0,
                    }}
                  >
                    <User size={16} strokeWidth={1.35} color={C.ink} /> Account
                    Details
                  </h4>
                  <button
                    style={{
                      display: "flex",
                      height: 28,
                      width: 28,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "9999px",
                      background: C.hoverBg,
                      color: C.textMuted,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Edit3 size={12} strokeWidth={1.45} />
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    fontSize: 11,
                    fontWeight: 300,
                  }}
                >
                  <div
                    style={{ display: "grid", gridTemplateColumns: "60px 1fr" }}
                  >
                    <span style={{ color: C.labelName }}>Name</span>
                    <span style={{ color: C.inkStrong }}>{profile.name}</span>
                  </div>
                  <div
                    style={{ display: "grid", gridTemplateColumns: "60px 1fr" }}
                  >
                    <span style={{ color: C.labelName }}>Email</span>
                    <span
                      style={{
                        color: C.inkStrong,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {profile.email}
                    </span>
                  </div>
                  <div
                    style={{ display: "grid", gridTemplateColumns: "60px 1fr" }}
                  >
                    <span style={{ color: C.labelName }}>Password</span>
                    <span style={{ color: C.inkStrong }}>
                      &bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;
                    </span>
                  </div>
                </div>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 11,
                  fontWeight: 500,
                  color: C.ink,
                  paddingTop: 16,
                }}
              >
                Full Details <ArrowRight size={14} strokeWidth={1.45} />
              </span>
            </section>

            <section
              style={{
                display: "flex",
                minHeight: 162,
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: "#fff",
                padding: "20px 24px",
              }}
            >
              <div>
                <div
                  style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <h4
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontFamily: "Georgia, serif",
                      fontSize: 16,
                      color: C.ink,
                      margin: 0,
                    }}
                  >
                    <Mail size={16} strokeWidth={1.35} color={C.ink} />{" "}
                    Marketing Preferences
                  </h4>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontWeight: 500,
                        color: C.ink,
                      }}
                    >
                      Email Updates
                    </span>
                    <span
                      style={{
                        marginTop: 4,
                        display: "block",
                        fontSize: 10.5,
                        fontWeight: 300,
                        color: C.textFaint,
                      }}
                    >
                      Receive updates about new collections and offers.
                    </span>
                  </div>
                  <button
                    onClick={onToggleMarketing}
                    role="switch"
                    aria-checked={marketingPreferences.emailUpdates}
                    style={{
                      position: "relative",
                      marginLeft: 12,
                      display: "inline-flex",
                      height: 22,
                      width: 40,
                      alignItems: "center",
                      borderRadius: "9999px",
                      border: "1px solid transparent",
                      cursor: "pointer",
                      background: marketingPreferences.emailUpdates
                        ? C.accent
                        : C.toggleOff,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        height: 20,
                        width: 20,
                        borderRadius: "9999px",
                        background: "#fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                        transform: marketingPreferences.emailUpdates
                          ? "translateX(18px)"
                          : "translateX(0)",
                        transition: "transform .2s ease",
                      }}
                    />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverviewPreview;
