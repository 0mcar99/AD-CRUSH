"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import s from "./AuthModal.module.css";
import { StepEmail, StepPassword, StepRegister, StepTryAnother, StepOtp, StepForgotPw, StepNewPassword, StepBiometric, StepSuccess, StepAdminLogin, StepGoogleAuth } from "./AuthSteps";

// steps: email, password, register, tryAnother, otp, forgotPw, otpReset, newPassword, biometric, success, adminLogin, googleAuth
export default function AuthModal({ onClose, onAuth }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [devCode, setDevCode] = useState("");
  const [otpTarget, setOtpTarget] = useState("");
  const [otpType, setOtpType] = useState("email");
  const [otpAction, setOtpAction] = useState("login");
  const [tiltStyle, setTiltStyle] = useState({});
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const cardRef = useRef(null);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Close on escape
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // 3D tilt
  const handleMouse = (e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const rx = ((e.clientY - r.top - r.height/2) / (r.height/2)) * -6;
    const ry = ((e.clientX - r.left - r.width/2) / (r.width/2)) * 6;
    setTiltStyle({ transform: `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.01,1.01,1.01)` });
  };
  const handleLeave = () => setTiltStyle({ transform: "perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)" });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const clearState = () => { setError(""); setSuccess(""); setLoading(false); };

  // ---- API Calls ----
  const checkEmail = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email"); return; }
    clearState(); setLoading(true);
    try {
      const res = await fetch("/api/auth/check-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (data.exists) setStep("password"); else setStep("register");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const doLogin = async () => {
    if (!password) { setError("Enter your password"); return; }
    clearState(); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return; }
      setStep("success");
      setTimeout(() => { onAuth?.({ email, role: data.role }); onClose(); }, 1500);
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const doAdminLogin = async () => {
    if (!adminUsername || !adminPassword) { setError("Enter admin credentials"); return; }
    clearState(); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: adminUsername, password: adminPassword }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Admin Login failed"); setLoading(false); return; }
      setStep("success");
      setTimeout(() => { onAuth?.({ email: adminUsername, role: data.role || "admin" }); onClose(); }, 1500);
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const doRegister = async () => {
    if (!password || password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPw) { setError("Passwords don't match"); return; }
    clearState(); setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, phone, countryCode }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      setStep("success");
      setTimeout(() => { onAuth?.({ email, role: "user" }); onClose(); }, 1500);
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const sendOtp = async (target, type, action) => {
    clearState(); setLoading(true);
    setOtpTarget(target); setOtpType(type); setOtpAction(action);
    setOtp(["","","","","",""]);
    try {
      const res = await fetch("/api/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target, type }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send code"); setLoading(false); return; }
      if (data.devCode) setDevCode(data.devCode);
      setResendTimer(60);
      if (action === "login") setStep("otp"); else setStep("otpReset");
      setSuccess(data.message || "Code sent!");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter all 6 digits"); return; }
    clearState(); setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target: otpTarget, code, action: otpAction }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Verification failed"); setLoading(false); return; }
      if (otpAction === "login") {
        setStep("success");
        setTimeout(() => { onAuth?.({ email }); onClose(); }, 1500);
      } else {
        setPassword(""); setConfirmPw("");
        setStep("newPassword");
      }
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (!password || password.length < 6) { setError("Min 6 characters"); return; }
    if (password !== confirmPw) { setError("Passwords don't match"); return; }
    clearState(); setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, newPassword: password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Reset failed"); setLoading(false); return; }
      showToast("Password reset! Please sign in.");
      setPassword(""); setConfirmPw("");
      setStep("password");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const doBiometric = async () => {
    clearState(); setLoading(true);
    try {
      if (!window.PublicKeyCredential) { setError("Biometric not supported on this browser"); setLoading(false); return; }
      const avail = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!avail) { setError("No fingerprint sensor detected"); setLoading(false); return; }
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "Ad Crush" },
          user: { id: new TextEncoder().encode(email), name: email, displayName: email },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000,
        }
      });
      if (cred) {
        // Biometric verified locally — now send OTP to create a server-side session
        // Note: In production, the WebAuthn assertion would be sent to the server for verification
        const otpRes = await fetch("/api/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target: email, type: "email" }) });
        const otpData = await otpRes.json();
        if (!otpRes.ok) { setError(otpData.error || "Could not start OTP session"); setLoading(false); return; }
        // Store the dev code and move to OTP step for final verification
        if (otpData.devCode) setDevCode(otpData.devCode);
        setOtpTarget(email); setOtpType("email"); setOtpAction("login");
        setOtp(["","","","","",""]);
        setResendTimer(60);
        setStep("otp");
        setSuccess("Biometric verified! Enter the code sent to your email to complete login.");
      }
    } catch (err) {
      setError(err.name === "NotAllowedError" ? "Biometric cancelled" : "Biometric failed: " + err.message);
    }
    setLoading(false);
  };

  const doGoogleLogin = async (googleEmail) => {
    clearState(); setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: googleEmail, name: googleEmail.split("@")[0], picture: "" })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Google Authentication failed");
        setLoading(false);
        setStep("googleAuth");
        return;
      }
      setStep("success");
      setTimeout(() => { onAuth?.({ email: googleEmail, role: data.role }); onClose(); }, 1500);
    } catch {
      setError("Network error");
      setStep("googleAuth");
    }
    setLoading(false);
  };

  const handleSocial = (provider) => {
    if (provider === "google") {
      clearState();
      setStep("googleAuth");
    } else {
      showToast(`${provider === "apple" ? "Apple" : "Social"} sign-in coming soon!`);
    }
  };

  // ---- Render Steps ----
  const renderStep = () => {
    switch (step) {
      case "email": return <StepEmail email={email} setEmail={setEmail} error={error} loading={loading} onContinue={checkEmail} onSocial={handleSocial}/>;
      case "password": return <StepPassword email={email} password={password} setPassword={setPassword} error={error} loading={loading} onLogin={doLogin} onForgot={() => { clearState(); setStep("forgotPw"); }} onTryAnother={() => { clearState(); setStep("tryAnother"); }} onBack={() => { clearState(); setStep("email"); }}/>;
      case "register": return <StepRegister email={email} password={password} setPassword={setPassword} confirmPw={confirmPw} setConfirmPw={setConfirmPw} phone={phone} setPhone={setPhone} countryCode={countryCode} setCountryCode={setCountryCode} error={error} loading={loading} onRegister={doRegister} onBack={() => { clearState(); setStep("email"); }}/>;
      case "tryAnother": return <StepTryAnother email={email} onEmailOtp={() => sendOtp(email, "email", "login")} onPhoneOtp={() => sendOtp(email, "phone", "login")} onBiometric={() => { clearState(); setStep("biometric"); }} onBack={() => { clearState(); setStep("password"); }}/>;
      case "otp": return <StepOtp type={otpType} target={otpTarget} otp={otp} setOtp={setOtp} error={error} success={success} loading={loading} onVerify={verifyOtp} onResend={() => sendOtp(otpTarget, otpType, otpAction)} resendTimer={resendTimer} onBack={() => { clearState(); setStep("tryAnother"); }} devCode={devCode}/>;
      case "forgotPw": return <StepForgotPw email={email} setEmail={setEmail} error={error} loading={loading} onSendCode={() => sendOtp(email, "email", "reset")} onBack={() => { clearState(); setStep("password"); }}/>;
      case "otpReset": return <StepOtp type="email" target={email} otp={otp} setOtp={setOtp} error={error} success={success} loading={loading} onVerify={verifyOtp} onResend={() => sendOtp(email, "email", "reset")} resendTimer={resendTimer} onBack={() => { clearState(); setStep("forgotPw"); }} devCode={devCode}/>;
      case "newPassword": return <StepNewPassword password={password} setPassword={setPassword} confirmPw={confirmPw} setConfirmPw={setConfirmPw} error={error} loading={loading} onReset={resetPassword} onBack={() => { clearState(); setStep("forgotPw"); }}/>;
      case "biometric": return <StepBiometric loading={loading} error={error} onAttempt={doBiometric} onBack={() => { clearState(); setStep("tryAnother"); }}/>;
      case "success": return <StepSuccess message="Welcome to Ad Crush!"/>;
      case "adminLogin": return <StepAdminLogin username={adminUsername} setUsername={setAdminUsername} password={adminPassword} setPassword={setAdminPassword} error={error} loading={loading} onLogin={doAdminLogin} onBack={() => { clearState(); setStep("email"); }}/>;
      case "googleAuth": return <StepGoogleAuth error={error} loading={loading} onSelectAccount={doGoogleLogin} onBack={() => { clearState(); setStep("email"); }}/>;
      default: return null;
    }
  };

  return (
    <>
      <div className={s.overlay}>
        <div className={s.backdrop} onClick={onClose}/>
        <div className={s.orbField}><div className={`${s.orb} ${s.orb1}`}/><div className={`${s.orb} ${s.orb2}`}/><div className={`${s.orb} ${s.orb3}`}/></div>
        <div ref={cardRef} className={s.card} style={tiltStyle} onMouseMove={handleMouse} onMouseLeave={handleLeave}>
          <div className={s.cardBorder}/>
          <div className={s.cardInner}>
            {step === "email" && (
              <button 
                type="button" 
                className={s.adminBtn} 
                onClick={() => { clearState(); setStep("adminLogin"); }}
                title="Admin Sign In"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </button>
            )}
            <button className={s.closeBtn} onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className={s.stepContainer}>{renderStep()}</div>
          </div>
        </div>
      </div>
      {toast && <div className={s.toast}>{toast}</div>}
    </>
  );
}
