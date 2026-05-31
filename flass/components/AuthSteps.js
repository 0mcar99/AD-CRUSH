"use client";
import { useState } from "react";
import s from "./AuthModal.module.css";
import { countries } from "@/lib/countries";

/* SVG Icons */
const MailSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l8.9 5.3a2 2 0 002.2 0L22 7"/>
  </svg>
);
const LockSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const EyeSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const PhoneSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);
const FpSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={s.fingerprintIcon}>
    <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 018 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-3.3 2.7-6 6-6 1.8 0 3.4.8 4.5 2"/><path d="M12 10a2 2 0 00-2 2c0 3-1 5.5-2.5 7.5"/><path d="M12 10a2 2 0 012 2c0 2.5-.5 5-1.5 7"/><path d="M18 15c-.2 1.5-.7 3-1.5 4.5"/><path d="M22 12c0 1.5-.3 3-.8 4.5"/>
  </svg>
);
const BackSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);
const GoogleSvg = () => (
  <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);
const AppleSvg = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
);

/* ---- Step: Email Entry ---- */
export function StepEmail({ email, setEmail, error, loading, onContinue, onSocial }) {
  return (
    <div className={s.step}>
      <div className={s.header}>
        <div className={s.iconWrap}><MailSvg/><div className={s.iconPulse}/></div>
        <p className={s.label}>Welcome</p>
        <h2 className={s.title}>Sign in to <span className="text-crush">Ad Crush</span></h2>
        <p className={s.subtitle}>Enter your email to continue</p>
      </div>
      <form onSubmit={e=>{e.preventDefault();onContinue();}}>
        <div className={s.inputGroup}>
          <div className={`${s.inputWrap} ${error?s.inputError:""}`}>
            <MailSvg/>
            <input className={s.input} type="email" placeholder="you@email.com" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} autoFocus/>
          </div>
        </div>
        <button type="submit" className={s.primaryBtn} disabled={loading}>
          <span className={s.btnContent}>{loading?<><svg viewBox="0 0 24 24" fill="none" className={s.spinner}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="50" strokeLinecap="round"/></svg>Checking...</>:"Continue"}</span>
        </button>
      </form>
      {error&&<div className={s.errorMsg}>{error}</div>}
      <div className={s.divider}><div className={s.dividerLine}/><span className={s.dividerText}>or continue with</span><div className={s.dividerLine}/></div>
      <div className={s.socialRow}>
        <button className={s.socialBtn} onClick={()=>onSocial("google")}><GoogleSvg/>Google</button>
        <button className={s.socialBtn} onClick={()=>onSocial("apple")}><AppleSvg/>Apple</button>
      </div>
    </div>
  );
}

/* ---- Step: Password (Login) ---- */
export function StepPassword({ email, password, setPassword, error, loading, onLogin, onForgot, onTryAnother, onBack }) {
  const [show,setShow]=useState(false);
  return (
    <div className={s.step}>
      <button className={s.backBtn} onClick={onBack}><BackSvg/>Back</button>
      <div className={s.header}>
        <div className={s.iconWrap}><LockSvg/><div className={s.iconPulse}/></div>
        <p className={s.label}>Welcome back</p>
        <h2 className={s.title}>Enter your password</h2>
        <p className={s.subtitle}>{email}</p>
      </div>
      <form onSubmit={e=>{e.preventDefault();onLogin();}}>
        <div className={s.inputGroup}>
          <div className={`${s.inputWrap} ${error?s.inputError:""}`}>
            <LockSvg/>
            <input className={s.input} type={show?"text":"password"} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} autoFocus/>
            <button type="button" className={s.pwToggle} onClick={()=>setShow(!show)}>{show?<EyeOffSvg/>:<EyeSvg/>}</button>
          </div>
        </div>
        <button type="submit" className={s.primaryBtn} disabled={loading}>
          <span className={s.btnContent}>{loading?<><svg viewBox="0 0 24 24" fill="none" className={s.spinner}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="50" strokeLinecap="round"/></svg>Signing in...</>:"Sign In"}</span>
        </button>
      </form>
      {error&&<div className={s.errorMsg}>{error}</div>}
      <div className={s.linkRow}>
        <button className={s.linkBtn} onClick={onForgot}>Forgot password?</button>
        <button className={s.linkBtn} onClick={onTryAnother}>Try another way</button>
      </div>
    </div>
  );
}

/* ---- Step: Register ---- */
export function StepRegister({ email, password, setPassword, confirmPw, setConfirmPw, phone, setPhone, countryCode, setCountryCode, error, loading, onRegister, onBack }) {
  const [show,setShow]=useState(false);
  const [dropOpen,setDropOpen]=useState(false);
  const [search,setSearch]=useState("");
  const sel=countries.find(c=>c.code===countryCode)||countries[0];
  const filtered=countries.filter(c=>c.country.toLowerCase().includes(search.toLowerCase())||c.code.includes(search));
  return (
    <div className={s.step}>
      <button className={s.backBtn} onClick={onBack}><BackSvg/>Back</button>
      <div className={s.header}>
        <p className={s.label}>Create Account</p>
        <h2 className={s.title}>Join <span className="text-crush">Ad Crush</span></h2>
        <p className={s.subtitle}>{email}</p>
      </div>
      <form onSubmit={e=>{e.preventDefault();onRegister();}}>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>Password</label>
          <div className={`${s.inputWrap} ${error?s.inputError:""}`}>
            <LockSvg/>
            <input className={s.input} type={show?"text":"password"} placeholder="Min 6 characters" value={password} onChange={e=>setPassword(e.target.value)} autoFocus/>
            <button type="button" className={s.pwToggle} onClick={()=>setShow(!show)}>{show?<EyeOffSvg/>:<EyeSvg/>}</button>
          </div>
        </div>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>Confirm Password</label>
          <div className={s.inputWrap}>
            <LockSvg/>
            <input className={s.input} type="password" placeholder="Confirm password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)}/>
          </div>
        </div>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>Phone Number (Optional)</label>
          <div className={s.phoneRow}>
            <div className={s.countrySelect}>
              <button type="button" className={s.countryBtn} onClick={()=>setDropOpen(!dropOpen)}>
                <span className={s.countryFlag}>{sel.flag}</span>
                <span>{sel.code}</span>
                <span className={`${s.countryArrow} ${dropOpen?s.countryArrowOpen:""}`}>▼</span>
              </button>
              {dropOpen&&(
                <div className={s.countryDropdown}>
                  <input className={s.countrySearch} placeholder="Search country..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
                  {filtered.map(c=>(
                    <button key={c.iso} type="button" className={`${s.countryOption} ${c.code===countryCode?s.countryOptionActive:""}`} onClick={()=>{setCountryCode(c.code);setDropOpen(false);setSearch("");}}>
                      <span className={s.countryFlag}>{c.flag}</span>
                      <span className={s.countryName}>{c.country}</span>
                      <span className={s.countryCode}>{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={`${s.inputWrap} ${s.phoneInput}`}>
              <PhoneSvg/>
              <input className={s.input} type="tel" placeholder="Phone number" value={phone} onChange={e=>setPhone(e.target.value)}/>
            </div>
          </div>
        </div>
        <button type="submit" className={s.primaryBtn} disabled={loading}>
          <span className={s.btnContent}>{loading?"Creating account...":"Create Account"}</span>
        </button>
      </form>
      {error&&<div className={s.errorMsg}>{error}</div>}
    </div>
  );
}

/* ---- Step: Try Another Way ---- */
export function StepTryAnother({ email, onEmailOtp, onPhoneOtp, onBiometric, onBack }) {
  return (
    <div className={s.step}>
      <button className={s.backBtn} onClick={onBack}><BackSvg/>Back</button>
      <div className={s.header}>
        <p className={s.label}>Verification</p>
        <h2 className={s.title}>Try another way</h2>
        <p className={s.subtitle}>Choose a verification method</p>
      </div>
      <div className={s.optionsList}>
        <button className={s.optionBtn} onClick={onEmailOtp}>
          <div className={s.optionIcon}><MailSvg/></div>
          <div className={s.optionText}><span className={s.optionTitle}>Email verification code</span><span className={s.optionDesc}>We'll send a 6-digit code to {email}</span></div>
        </button>
        <button className={s.optionBtn} onClick={onPhoneOtp}>
          <div className={s.optionIcon}><PhoneSvg/></div>
          <div className={s.optionText}><span className={s.optionTitle}>Phone verification code</span><span className={s.optionDesc}>Get a code via SMS to your phone</span></div>
        </button>
        <button className={s.optionBtn} onClick={onBiometric}>
          <div className={s.optionIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 018 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-3.3 2.7-6 6-6"/><path d="M12 10a2 2 0 00-2 2c0 3-1 5.5-2.5 7.5"/></svg></div>
          <div className={s.optionText}><span className={s.optionTitle}>Biometric / Fingerprint</span><span className={s.optionDesc}>Use your device fingerprint sensor</span></div>
        </button>
      </div>
    </div>
  );
}

/* ---- Step: OTP Verification ---- */
export function StepOtp({ type, target, otp, setOtp, error, success, loading, onVerify, onResend, resendTimer, onBack, devCode }) {
  const handleChange = (i, val) => {
    if (val.length > 1) val = val.slice(-1);
    if (val && !/^\d$/.test(val)) return;
    const arr = [...otp];
    arr[i] = val;
    setOtp(arr);
    if (val && i < 5) {
      const next = document.getElementById(`otp-${i+1}`);
      next?.focus();
    }
  };
  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      document.getElementById(`otp-${i-1}`)?.focus();
    }
  };
  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (text.length) {
      setOtp(text.split("").concat(Array(6-text.length).fill("")));
      e.preventDefault();
    }
  };
  return (
    <div className={s.step}>
      <button className={s.backBtn} onClick={onBack}><BackSvg/>Back</button>
      <div className={s.header}>
        <div className={s.iconWrap}>{type==="email"?<MailSvg/>:<PhoneSvg/>}<div className={s.iconPulse}/></div>
        <p className={s.label}>Verification</p>
        <h2 className={s.title}>Enter the code</h2>
        <p className={s.subtitle}>Sent to {target}</p>
        {devCode&&<p style={{color:"var(--accent-orange)",fontFamily:"var(--font-mono)",fontSize:12,marginTop:8}}>Dev code: {devCode}</p>}
      </div>
      <div className={s.otpGrid} onPaste={handlePaste}>
        {otp.map((d,i)=>(
          <input key={i} id={`otp-${i}`} className={`${s.otpBox} ${d?s.otpFilled:""}`} type="text" inputMode="numeric" maxLength={1} value={d} onChange={e=>handleChange(i,e.target.value)} onKeyDown={e=>handleKey(i,e)} autoFocus={i===0}/>
        ))}
      </div>
      <button className={s.primaryBtn} disabled={loading||otp.join("").length<6} onClick={onVerify}>
        <span className={s.btnContent}>{loading?"Verifying...":"Verify Code"}</span>
      </button>
      {error&&<div className={s.errorMsg}>{error}</div>}
      {success&&<div className={s.successMsg}>{success}</div>}
      <div className={s.resendRow}>
        {resendTimer>0?<span>Resend in {resendTimer}s</span>:<button className={s.resendBtn} onClick={onResend}>Resend code</button>}
      </div>
    </div>
  );
}

/* ---- Step: Forgot Password ---- */
export function StepForgotPw({ email, setEmail, error, loading, onSendCode, onBack }) {
  return (
    <div className={s.step}>
      <button className={s.backBtn} onClick={onBack}><BackSvg/>Back</button>
      <div className={s.header}>
        <p className={s.label}>Password Reset</p>
        <h2 className={s.title}>Forgot password?</h2>
        <p className={s.subtitle}>We'll send a reset code to your email</p>
      </div>
      <form onSubmit={e=>{e.preventDefault();onSendCode();}}>
        <div className={s.inputGroup}>
          <div className={`${s.inputWrap} ${error?s.inputError:""}`}>
            <MailSvg/>
            <input className={s.input} type="email" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} autoFocus/>
          </div>
        </div>
        <button type="submit" className={s.primaryBtn} disabled={loading}>
          <span className={s.btnContent}>{loading?"Sending...":"Send Reset Code"}</span>
        </button>
      </form>
      {error&&<div className={s.errorMsg}>{error}</div>}
    </div>
  );
}

/* ---- Step: New Password ---- */
export function StepNewPassword({ password, setPassword, confirmPw, setConfirmPw, error, loading, onReset, onBack }) {
  const [show,setShow]=useState(false);
  return (
    <div className={s.step}>
      <button className={s.backBtn} onClick={onBack}><BackSvg/>Back</button>
      <div className={s.header}>
        <div className={s.iconWrap}><LockSvg/><div className={s.iconPulse}/></div>
        <p className={s.label}>Almost done</p>
        <h2 className={s.title}>Set new password</h2>
      </div>
      <form onSubmit={e=>{e.preventDefault();onReset();}}>
        <div className={s.inputGroup}>
          <div className={`${s.inputWrap} ${error?s.inputError:""}`}>
            <LockSvg/>
            <input className={s.input} type={show?"text":"password"} placeholder="New password (min 6 chars)" value={password} onChange={e=>setPassword(e.target.value)} autoFocus/>
            <button type="button" className={s.pwToggle} onClick={()=>setShow(!show)}>{show?<EyeOffSvg/>:<EyeSvg/>}</button>
          </div>
        </div>
        <div className={s.inputGroup}>
          <div className={s.inputWrap}>
            <LockSvg/>
            <input className={s.input} type="password" placeholder="Confirm new password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)}/>
          </div>
        </div>
        <button type="submit" className={s.primaryBtn} disabled={loading}>
          <span className={s.btnContent}>{loading?"Resetting...":"Reset Password"}</span>
        </button>
      </form>
      {error&&<div className={s.errorMsg}>{error}</div>}
    </div>
  );
}

/* ---- Step: Biometric ---- */
export function StepBiometric({ loading, error, onAttempt, onBack }) {
  return (
    <div className={s.step}>
      <button className={s.backBtn} onClick={onBack}><BackSvg/>Back</button>
      <div className={s.header}>
        <p className={s.label}>Biometric</p>
        <h2 className={s.title}>Fingerprint verification</h2>
      </div>
      <div className={s.biometricWrap}>
        <FpSvg/>
        <p className={s.biometricText}>{loading?"Verifying your identity...":"Touch your fingerprint sensor to verify"}</p>
        <button className={s.primaryBtn} onClick={onAttempt} disabled={loading} style={{maxWidth:240}}>
          <span className={s.btnContent}>{loading?"Scanning...":"Start Scan"}</span>
        </button>
      </div>
      {error&&<div className={s.errorMsg}>{error}</div>}
    </div>
  );
}

/* ---- Step: Success ---- */
export function StepSuccess({ message }) {
  return (
    <div className={s.step}>
      <div className={s.successWrap}>
        <div className={s.successCheck}>
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--success)" strokeWidth="2" className={s.checkCircle}/>
            <path d="M8 12l3 3 5-5" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={s.checkMark}/>
          </svg>
        </div>
        <h3 className={s.successTitle}>{message||"You're in!"}</h3>
        <p className={s.successSub}>Redirecting...</p>
      </div>
    </div>
  );
}

/* ---- Step: Admin Login ---- */
export function StepAdminLogin({ username, setUsername, password, setPassword, error, loading, onLogin, onBack }) {
  const [show, setShow] = useState(false);
  return (
    <div className={s.step}>
      <button className={s.backBtn} onClick={onBack}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginRight: 6 }}>
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>
      <div className={s.header}>
        <div className={s.iconWrap}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <div className={s.iconPulse}/>
        </div>
        <p className={s.label}>Secure access</p>
        <h2 className={s.title}>Admin <span className="text-crush">Portal</span></h2>
        <p className={s.subtitle}>Sign in with administrator credentials</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>Username / Email</label>
          <div className={`${s.inputWrap} ${error ? s.inputError : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              className={s.input}
              type="text"
              placeholder="Admin Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
        </div>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>Password</label>
          <div className={`${s.inputWrap} ${error ? s.inputError : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input
              className={s.input}
              type={show ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className={s.pwToggle} onClick={() => setShow(!show)}>
              {show ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        <button type="submit" className={s.primaryBtn} disabled={loading}>
          <span className={s.btnContent}>
            {loading ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" className={s.spinner}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="50" strokeLinecap="round"/>
                </svg>
                Verifying...
              </>
            ) : (
              "Sign In"
            )}
          </span>
        </button>
      </form>
      {error && <div className={s.errorMsg}>{error}</div>}
    </div>
  );
}

/* ---- Step: Google Authentication ---- */
export function StepGoogleAuth({ onSelectAccount, onBack, error, loading }) {
  const [customEmail, setCustomEmail] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [handshakeStep, setHandshakeStep] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState("");

  const accounts = [
    { name: "Omkar", email: "omkar@gmail.com", avatar: "O" },
    { name: "Ad Crush Tester", email: "tester@adcrush.com", avatar: "T" }
  ];

  const handleSelect = (email) => {
    setSelectedEmail(email);
    let step = 1;
    setHandshakeStep(step);
    const interval = setInterval(() => {
      step++;
      if (step <= 3) {
        setHandshakeStep(step);
      } else {
        clearInterval(interval);
        onSelectAccount(email);
      }
    }, 800);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmail)) return;
    handleSelect(customEmail);
  };

  if (handshakeStep > 0) {
    const handshakeMsgs = [
      "",
      "Verifying Google credentials...",
      "Exchanging secure OAuth 2.0 handshake tokens...",
      "Establishing cryptographic session with adcrush.com..."
    ];
    return (
      <div className={s.step} style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ display: "inline-flex", marginBottom: 20 }}>
          <svg viewBox="0 0 24 24" width="40" height="40"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        </div>
        <h3 className={s.successTitle} style={{ fontSize: 18, marginBottom: 8 }}>Google Sign-In</h3>
        <p className={s.successSub} style={{ fontSize: 13, color: "var(--accent-orange)", fontFamily: "var(--font-mono)", marginBottom: 24 }}>{selectedEmail}</p>
        
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 44, height: 44, animation: "spin 1.2s linear infinite", color: "var(--accent-orange)" }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40" strokeLinecap="round" opacity="0.3"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="15" strokeLinecap="round"/>
          </svg>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", animation: "pulse-ring 2s infinite" }}>
          {handshakeMsgs[handshakeStep]}
        </p>
      </div>
    );
  }

  return (
    <div className={s.step}>
      <button className={s.backBtn} onClick={onBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginRight: 6 }}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>Back</button>
      <div className={s.header} style={{ marginBottom: 20 }}>
        <div style={{ display: "inline-flex", marginBottom: 12 }}>
          <svg viewBox="0 0 24 24" width="36" height="36"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        </div>
        <h2 className={s.title} style={{ fontSize: 22 }}>Sign in with Google</h2>
        <p className={s.subtitle}>to continue to adcrush.com</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "16px 0" }}>
        {accounts.map((acc) => (
          <button
            key={acc.email}
            type="button"
            onClick={() => handleSelect(acc.email)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.02)",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-orange)";
              e.currentTarget.style.background = "rgba(255,107,0,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--accent-orange)",
              color: "var(--bg-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14
            }}>
              {acc.avatar}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{acc.name}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{acc.email}</span>
            </div>
          </button>
        ))}

        {!showCustom ? (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px dashed var(--border)",
              background: "transparent",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              color: "var(--text-muted)",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-orange)";
              e.currentTarget.style.color = "var(--accent-orange)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px dashed currentColor",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18
            }}>
              +
            </div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Use another account</span>
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} style={{ marginTop: 8 }}>
            <div className={s.inputGroup}>
              <div className={s.inputWrap} style={{ borderRadius: "12px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18" style={{ marginLeft: 12, marginRight: 8, color: "var(--text-muted)" }}>
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  className={s.input}
                  type="email"
                  placeholder="Enter your Google email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  style={{ padding: "12px 8px" }}
                  autoFocus
                  required
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="submit" className={s.primaryBtn} style={{ margin: 0, padding: "10px 16px", flex: 1, borderRadius: "12px" }}>
                Next
              </button>
              <button type="button" className={s.primaryBtn} onClick={() => setShowCustom(false)} style={{ margin: 0, padding: "10px 16px", flex: 1, borderRadius: "12px", background: "none", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, textAlign: "center" }}>
        To continue, Google will share your name, email address, language preference, and profile picture with adcrush.com.
      </div>
      {error && <div className={s.errorMsg}>{error}</div>}
    </div>
  );
}

