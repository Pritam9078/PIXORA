import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

  .pixora-body {
    font-family: 'Inter', sans-serif;
    background-color: #0D0E12;
    color: #d4e4fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    user-select: none;
  }

  .glass-panel {
    background: rgba(13, 14, 18, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .text-glow-lime {
    text-shadow: 0 0 10px rgba(195, 244, 0, 0.5);
  }

  .grid-overlay {
    background-image: linear-gradient(
      0deg,
      transparent 24%,
      rgba(195, 244, 0, 0.05) 25%,
      rgba(195, 244, 0, 0.05) 26%,
      transparent 27%,
      transparent 74%,
      rgba(195, 244, 0, 0.05) 75%,
      rgba(195, 244, 0, 0.05) 76%,
      transparent 77%,
      transparent
    );
    background-size: 50px 50px;
  }

  .input-field {
    width: 100%;
    background: #010f1f;
    border: none;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    color: white;
    font-family: 'Space Grotesk', monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
    font-weight: 500;
    padding: 16px;
    transition: border-color 0.2s;
    outline: none;
    box-sizing: border-box;
  }

  .input-field:focus {
    border-bottom-color: #c3f400;
  }

  .input-field::placeholder {
    color: rgba(255, 255, 255, 0.1);
  }

  .submit-btn {
    width: 100%;
    background: #c3f400;
    color: #283500;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 20px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: background 0.2s, transform 0.1s;
    position: relative;
    overflow: hidden;
  }

  .submit-btn:hover {
    background: #abd600;
  }

  .submit-btn:active {
    transform: scale(0.97);
  }

  .register-btn {
    width: 100%;
    display: block;
    text-align: center;
    border: 1px solid rgba(195, 244, 0, 0.2);
    color: #c3f400;
    font-family: 'Space Grotesk', monospace;
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 12px;
    background: transparent;
    cursor: pointer;
    transition: background 0.2s;
    text-decoration: none;
  }

  .register-btn:hover {
    background: rgba(195, 244, 0, 0.05);
  }

  .code-label {
    font-family: 'Space Grotesk', monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
    font-weight: 500;
    text-transform: uppercase;
  }

  .headline-xl {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .corner-tl { position: absolute; top: 0; left: 0; width: 16px; height: 16px; border-top: 2px solid rgba(195, 244, 0, 0.4); border-left: 2px solid rgba(195, 244, 0, 0.4); }
  .corner-tr { position: absolute; top: 0; right: 0; width: 16px; height: 16px; border-top: 2px solid rgba(195, 244, 0, 0.4); border-right: 2px solid rgba(195, 244, 0, 0.4); }
  .corner-bl { position: absolute; bottom: 0; left: 0; width: 16px; height: 16px; border-bottom: 2px solid rgba(195, 244, 0, 0.4); border-left: 2px solid rgba(195, 244, 0, 0.4); }
  .corner-br { position: absolute; bottom: 0; right: 0; width: 16px; height: 16px; border-bottom: 2px solid rgba(195, 244, 0, 0.4); border-right: 2px solid rgba(195, 244, 0, 0.4); }

  @media (max-width: 768px) {
    .headline-xl { font-size: 32px; }
    .corner-data { display: none; }
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Redirect if already logged in and profile is loaded
  useEffect(() => {
    if (user && profile) {
      const role = profile.role || 'student';
      // Map specific roles to their respective dashboard routes
      const dashboardRoutes = {
        student: '/dashboard/student',
        instructor: '/dashboard/instructor',
        college_admin: '/dashboard/college',
        partner: '/dashboard/partner',
        super_admin: '/dashboard/admin'
      };
      
      navigate(dashboardRoutes[role] || `/dashboard/student`);
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // We rely on the useEffect above to handle the routing once AuthContext provides the profile.
      // But if we want an immediate fallback:
      const role = data.user.user_metadata?.role || 'student';
      const dashboardRoutes = {
        student: '/dashboard/student',
        instructor: '/dashboard/instructor',
        college_admin: '/dashboard/college',
        partner: '/dashboard/partner',
        super_admin: '/dashboard/admin'
      };
      // For email auth, if they don't have a profile yet (unlikely with triggers, but possible):
      // We will let useEffect take over because fetchProfile will happen soon.
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="pixora-body">
        {/* Orbital Background */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(circle at 50% 50%, #122131 0%, #051424 100%)",
            opacity: 0.5
          }} />
          <img
            alt="Earth from orbit"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.2, mixBlendMode: "overlay" }}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgAMY32fY4K7yEMGg53B-7iuoqJV9Wl9oJMT7SSg-BpSGrr81PoP-QH3j9ftV8pcZq-5N7OSeALjFaLX-1aYzvKYuy84KkHVyKf96WcaitIN0rcza6gGAGo48evzb_ZyPA5OWze2iUeUhLmmbwq75BXmgfX6uwdbmp6H6PO6so9hFMbf9zvkbPrGOU7Uwx2ilKKQhaAP39hq1i3kZnHwJJcl2Zt81-R_ftzOd7yjnMNfBR9Tom6Ie8-bAqOQwdMk31ydUY5uD4xqGk"
          />
          <div className="grid-overlay" style={{ position: "absolute", inset: 0, opacity: 0.1, pointerEvents: "none" }} />
        </div>

        {/* Header */}
        <header style={{
          position: "fixed", top: 0, left: 0, width: "100%", zIndex: 50,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "0 32px", height: "80px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          boxSizing: "border-box"
        }}>
          <Link to="/" style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: "20px", fontWeight: 700,
            letterSpacing: "-0.02em", color: "white", textDecoration: "none",
            borderLeft: "4px solid #c3f400", paddingLeft: "12px"
          }}>
            PIXORA
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(195,244,0,0.5)" }} className="code-label">
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>sensors</span>
              <span>LINK: STABLE</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(195,244,0,0.5)" }} className="code-label">
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>public</span>
              <span>ORBIT: 402KM</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          position: "relative", zIndex: 20, flexGrow: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px", paddingTop: "100px", paddingBottom: "80px",
          overflowY: "auto"
        }}>
          {/* Corner Data — decorative */}
          <div className="corner-data" style={{
            position: "absolute", top: "96px", left: "32px",
            fontFamily: "'Space Grotesk', monospace", fontSize: "12px",
            letterSpacing: "0.05em", color: "#64748b"
          }}>
            <p>LAT: 28.5729° N</p>
            <p>LON: 80.6490° W</p>
            <p style={{ color: "rgba(195,244,0,0.3)", marginTop: "8px" }}>SYS_INIT: COMPLETED</p>
          </div>
          <div className="corner-data" style={{
            position: "absolute", bottom: "96px", right: "32px",
            fontFamily: "'Space Grotesk', monospace", fontSize: "12px",
            letterSpacing: "0.05em", color: "#64748b", textAlign: "right"
          }}>
            <p>CORE_TEMP: 32.4°C</p>
            <p>ENTROPY: 0.00042</p>
            <p style={{ color: "rgba(195,244,0,0.3)", marginTop: "8px" }}>ENCRYPTION: AES-2048-X</p>
          </div>

          <div style={{ width: "100%", maxWidth: "480px" }}>
            {/* Terminal Header */}
            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "64px", height: "64px", borderRadius: "50%",
                border: "1px solid rgba(195,244,0,0.3)", marginBottom: "16px",
                background: "rgba(195,244,0,0.05)"
              }}>
                <span className="material-symbols-outlined" style={{ color: "#c3f400", fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>
                  shield_person
                </span>
              </div>
              <h1 className="headline-xl" style={{ color: "white", textTransform: "uppercase", margin: 0 }}>
                Terminal Access
              </h1>
              <p className="code-label" style={{ color: "#c7c6cb", letterSpacing: "0.2em", marginTop: "8px" }}>
                Orbital Authorization Required
              </p>
            </div>

            {/* Auth Card */}
            <div className="glass-panel" style={{ padding: "40px", position: "relative" }}>
              {/* Corner decorations */}
              <div className="corner-tl" />
              <div className="corner-tr" />
              <div className="corner-bl" />
              <div className="corner-br" />

              {error && (
                <div style={{ 
                  marginBottom: "24px", padding: "12px", 
                  backgroundColor: "rgba(239, 68, 68, 0.1)", 
                  border: "1px solid rgba(239, 68, 68, 0.2)", 
                  color: "#ef4444", fontSize: "12px", 
                  fontFamily: "'Space Grotesk', monospace",
                  textAlign: "center"
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Neural Identity */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    className="code-label"
                    htmlFor="email"
                    style={{
                      color: "rgba(195,244,0,0.7)",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}
                  >
                    <span>Neural Identity</span>
                    <span style={{ fontSize: "10px", opacity: 0.4 }}>INPUT_REQ</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="input-field"
                      id="email"
                      type="email"
                      placeholder="LEARNER@PIXORA.ACADEMY"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ paddingRight: "48px" }}
                    />
                    <span className="material-symbols-outlined" style={{
                      position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
                      color: "rgba(255,255,255,0.2)", fontSize: "20px"
                    }}>alternate_email</span>
                  </div>
                </div>

                {/* Access Sequence */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    className="code-label"
                    htmlFor="password"
                    style={{
                      color: "rgba(195,244,0,0.7)",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}
                  >
                    <span>Access Sequence</span>
                    <span style={{ fontSize: "10px", opacity: 0.4 }}>ENCRYPTED</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="input-field"
                      id="password"
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ paddingRight: "48px" }}
                    />
                    <span className="material-symbols-outlined" style={{
                      position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
                      color: "rgba(255,255,255,0.2)", fontSize: "20px"
                    }}>key</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="code-label"
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#c7c6cb", fontSize: "10px", letterSpacing: "0.05em",
                        textTransform: "uppercase", padding: 0
                      }}
                      onMouseEnter={e => e.target.style.color = "#c3f400"}
                      onMouseLeave={e => e.target.style.color = "#c7c6cb"}
                    >
                      Forgot Sequence?
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button className="submit-btn" type="submit" disabled={loading}>
                  <span style={{ position: "relative", zIndex: 10 }}>
                    {loading ? 'CALIBRATING...' : 'Initialize Session'}
                  </span>
                  {!loading && (
                    <span className="material-symbols-outlined" style={{
                      position: "relative", zIndex: 10,
                      fontVariationSettings: "'FILL' 1"
                    }}>bolt</span>
                  )}
                </button>

                {/* Social Login */}
                <div style={{
                  paddingTop: "24px",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  display: "flex", flexDirection: "column", gap: "16px"
                }}>
                  <p className="code-label" style={{ color: "#64748b", fontSize: "11px", textAlign: "center" }}>
                    Or Link via Protocol
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <button 
                      type="button"
                      onClick={() => handleSocialLogin('google')}
                      className="register-btn" 
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    >
                      <img src="https://www.google.com/favicon.ico" style={{ width: "14px", height: "14px", filter: "grayscale(1)" }} alt="Google" />
                      <span>Google</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSocialLogin('github')}
                      className="register-btn" 
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    >
                      <img src="https://github.com/favicon.ico" style={{ width: "14px", height: "14px", filter: "invert(1)" }} alt="GitHub" />
                      <span>GitHub</span>
                    </button>
                  </div>
                </div>

                {/* Footer Links */}
                <div style={{
                  paddingTop: "16px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "16px"
                }}>
                  <p className="code-label" style={{ color: "#64748b", fontSize: "11px" }}>
                    New to the Platform?
                  </p>
                  <Link to="/signup/student" className="register-btn">
                    New Learner? Begin Onboarding
                  </Link>
                </div>
              </form>
            </div>

            {/* Protocol Badge */}
            <div style={{
              marginTop: "32px", display: "flex", justifyContent: "center",
              alignItems: "center", gap: "16px"
            }}>
              <div style={{ height: "1px", width: "48px", background: "rgba(255,255,255,0.1)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="code-label">
                <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#64748b" }}>lock</span>
                <span style={{ color: "#64748b", fontSize: "10px", letterSpacing: "0.05em" }}>PROTOCOL 8.2 ENFORCED</span>
              </div>
              <div style={{ height: "1px", width: "48px", background: "rgba(255,255,255,0.1)" }} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          width: "100%", display: "flex", flexDirection: "row", flexWrap: "wrap",
          justifyContent: "space-between", alignItems: "center",
          padding: "24px 48px", gap: "16px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "#0D0E12", position: "relative", zIndex: 20,
          boxSizing: "border-box"
        }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: "10px",
            letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 300, color: "#64748b"
          }}>
            © 2024 PIXORA INTERSTELLAR ACADEMY. ALL RIGHTS RESERVED.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {["Protocol", "Privacy", "Neural Link Terms"].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: "10px",
                  letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 300,
                  color: "#64748b", textDecoration: "none", transition: "color 0.2s"
                }}
                onMouseEnter={e => e.target.style.color = "#BEF264"}
                onMouseLeave={e => e.target.style.color = "#64748b"}
              >
                {link}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
