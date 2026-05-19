// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/wallet';
import { Wallet, AlertCircle } from 'lucide-react';
import { z } from 'zod';

// Field-level validation runs before any network call. Surfaces a clear
// inline message for empty / malformed inputs so the user knows what to
// fix without round-tripping the API.
const loginSchema = z.object(stryMutAct_9fa48("394") ? {} : (stryCov_9fa48("394"), {
  email: stryMutAct_9fa48("395") ? z.string().max(1, 'Email is required').email('Enter a valid email address') : (stryCov_9fa48("395"), z.string().min(1, stryMutAct_9fa48("396") ? "" : (stryCov_9fa48("396"), 'Email is required')).email(stryMutAct_9fa48("397") ? "" : (stryCov_9fa48("397"), 'Enter a valid email address'))),
  password: stryMutAct_9fa48("398") ? z.string().max(1, 'Password is required') : (stryCov_9fa48("398"), z.string().min(1, stryMutAct_9fa48("399") ? "" : (stryCov_9fa48("399"), 'Password is required')))
}));
type FieldErrors = Partial<Record<'email' | 'password', string>>;

// Public demo accounts. Surfacing them on the sign-in screen means a
// first-time visitor can actually get into the app instead of being
// locked out by a credential wall.
const DEMO_ACCOUNTS = stryMutAct_9fa48("400") ? [] : (stryCov_9fa48("400"), [stryMutAct_9fa48("401") ? {} : (stryCov_9fa48("401"), {
  label: stryMutAct_9fa48("402") ? "" : (stryCov_9fa48("402"), 'Alice'),
  email: stryMutAct_9fa48("403") ? "" : (stryCov_9fa48("403"), 'alice@demo.local')
}), stryMutAct_9fa48("404") ? {} : (stryCov_9fa48("404"), {
  label: stryMutAct_9fa48("405") ? "" : (stryCov_9fa48("405"), 'Bob'),
  email: stryMutAct_9fa48("406") ? "" : (stryCov_9fa48("406"), 'bob@demo.local')
}), stryMutAct_9fa48("407") ? {} : (stryCov_9fa48("407"), {
  label: stryMutAct_9fa48("408") ? "" : (stryCov_9fa48("408"), 'Carol'),
  email: stryMutAct_9fa48("409") ? "" : (stryCov_9fa48("409"), 'carol@demo.local')
})]);
const DEMO_PASSWORD = stryMutAct_9fa48("410") ? "" : (stryCov_9fa48("410"), 'pass1234');
export function LoginPage() {
  if (stryMutAct_9fa48("411")) {
    {}
  } else {
    stryCov_9fa48("411");
    const {
      isAuthenticated,
      login
    } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState(stryMutAct_9fa48("412") ? "Stryker was here!" : (stryCov_9fa48("412"), ''));
    const [password, setPassword] = useState(stryMutAct_9fa48("413") ? "Stryker was here!" : (stryCov_9fa48("413"), ''));
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [error, setError] = useState(stryMutAct_9fa48("414") ? "Stryker was here!" : (stryCov_9fa48("414"), ''));
    const [loading, setLoading] = useState(stryMutAct_9fa48("415") ? true : (stryCov_9fa48("415"), false));
    if (stryMutAct_9fa48("417") ? false : stryMutAct_9fa48("416") ? true : (stryCov_9fa48("416", "417"), isAuthenticated)) return <Navigate to="/" replace />;
    const handleSubmit = async (e: React.FormEvent) => {
      if (stryMutAct_9fa48("418")) {
        {}
      } else {
        stryCov_9fa48("418");
        e.preventDefault();
        setError(stryMutAct_9fa48("419") ? "Stryker was here!" : (stryCov_9fa48("419"), ''));
        const parsed = loginSchema.safeParse(stryMutAct_9fa48("420") ? {} : (stryCov_9fa48("420"), {
          email,
          password
        }));
        if (stryMutAct_9fa48("423") ? false : stryMutAct_9fa48("422") ? true : stryMutAct_9fa48("421") ? parsed.success : (stryCov_9fa48("421", "422", "423"), !parsed.success)) {
          if (stryMutAct_9fa48("424")) {
            {}
          } else {
            stryCov_9fa48("424");
            const next: FieldErrors = {};
            for (const issue of parsed.error.issues) {
              if (stryMutAct_9fa48("425")) {
                {}
              } else {
                stryCov_9fa48("425");
                const key = issue.path[0] as 'email' | 'password';
                if (stryMutAct_9fa48("428") ? false : stryMutAct_9fa48("427") ? true : stryMutAct_9fa48("426") ? next[key] : (stryCov_9fa48("426", "427", "428"), !next[key])) next[key] = issue.message;
              }
            }
            setFieldErrors(next);
            return;
          }
        }
        setFieldErrors({});
        setLoading(stryMutAct_9fa48("429") ? false : (stryCov_9fa48("429"), true));
        try {
          if (stryMutAct_9fa48("430")) {
            {}
          } else {
            stryCov_9fa48("430");
            const res = await authApi.login(parsed.data.email, parsed.data.password);
            const d = res.data.data;
            login(d.token, d.fullName, d.phoneNumber);
            navigate(stryMutAct_9fa48("431") ? "" : (stryCov_9fa48("431"), '/'));
          }
        } catch {
          if (stryMutAct_9fa48("432")) {
            {}
          } else {
            stryCov_9fa48("432");
            setError(stryMutAct_9fa48("433") ? "" : (stryCov_9fa48("433"), 'Invalid email or password'));
          }
        } finally {
          if (stryMutAct_9fa48("434")) {
            {}
          } else {
            stryCov_9fa48("434");
            setLoading(stryMutAct_9fa48("435") ? true : (stryCov_9fa48("435"), false));
          }
        }
      }
    };
    return <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-indigo-800 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
            <Wallet className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">M-Wallet</h1>
          <p className="text-indigo-200 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl p-6 space-y-4">
          {stryMutAct_9fa48("438") ? error || <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
              <AlertCircle size={16} /> {error}
            </div> : stryMutAct_9fa48("437") ? false : stryMutAct_9fa48("436") ? true : (stryCov_9fa48("436", "437", "438"), error && <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
              <AlertCircle size={16} /> {error}
            </div>)}
          <div>
            <input type="email" value={email} onChange={stryMutAct_9fa48("439") ? () => undefined : (stryCov_9fa48("439"), e => setEmail(e.target.value))} placeholder="Email" aria-invalid={stryMutAct_9fa48("440") ? !fieldErrors.email : (stryCov_9fa48("440"), !(stryMutAct_9fa48("441") ? fieldErrors.email : (stryCov_9fa48("441"), !fieldErrors.email)))} aria-describedby={fieldErrors.email ? stryMutAct_9fa48("442") ? "" : (stryCov_9fa48("442"), 'email-error') : undefined} className={stryMutAct_9fa48("443") ? `` : (stryCov_9fa48("443"), `w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${fieldErrors.email ? stryMutAct_9fa48("444") ? "" : (stryCov_9fa48("444"), 'border-red-400') : stryMutAct_9fa48("445") ? "" : (stryCov_9fa48("445"), 'border-gray-300')}`)} />
            {stryMutAct_9fa48("448") ? fieldErrors.email || <p id="email-error" className="mt-1 text-xs text-red-600">
                {fieldErrors.email}
              </p> : stryMutAct_9fa48("447") ? false : stryMutAct_9fa48("446") ? true : (stryCov_9fa48("446", "447", "448"), fieldErrors.email && <p id="email-error" className="mt-1 text-xs text-red-600">
                {fieldErrors.email}
              </p>)}
          </div>
          <div>
            <input type="password" value={password} onChange={stryMutAct_9fa48("449") ? () => undefined : (stryCov_9fa48("449"), e => setPassword(e.target.value))} placeholder="Password" aria-invalid={stryMutAct_9fa48("450") ? !fieldErrors.password : (stryCov_9fa48("450"), !(stryMutAct_9fa48("451") ? fieldErrors.password : (stryCov_9fa48("451"), !fieldErrors.password)))} aria-describedby={fieldErrors.password ? stryMutAct_9fa48("452") ? "" : (stryCov_9fa48("452"), 'password-error') : undefined} className={stryMutAct_9fa48("453") ? `` : (stryCov_9fa48("453"), `w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${fieldErrors.password ? stryMutAct_9fa48("454") ? "" : (stryCov_9fa48("454"), 'border-red-400') : stryMutAct_9fa48("455") ? "" : (stryCov_9fa48("455"), 'border-gray-300')}`)} />
            {stryMutAct_9fa48("458") ? fieldErrors.password || <p id="password-error" className="mt-1 text-xs text-red-600">
                {fieldErrors.password}
              </p> : stryMutAct_9fa48("457") ? false : stryMutAct_9fa48("456") ? true : (stryCov_9fa48("456", "457", "458"), fieldErrors.password && <p id="password-error" className="mt-1 text-xs text-red-600">
                {fieldErrors.password}
              </p>)}
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? stryMutAct_9fa48("459") ? "" : (stryCov_9fa48("459"), 'Signing in...') : stryMutAct_9fa48("460") ? "" : (stryCov_9fa48("460"), 'Sign In')}
          </button>
        </form>

        <div className="mt-5 rounded-2xl bg-white/10 p-4 text-center">
          <p className="text-xs text-indigo-200">
            Demo accounts — tap to fill, then Sign In
          </p>
          <div className="mt-3 flex justify-center gap-2">
            {DEMO_ACCOUNTS.map(stryMutAct_9fa48("461") ? () => undefined : (stryCov_9fa48("461"), acc => <button key={acc.email} type="button" onClick={() => {
              if (stryMutAct_9fa48("462")) {
                {}
              } else {
                stryCov_9fa48("462");
                setEmail(acc.email);
                setPassword(DEMO_PASSWORD);
                setFieldErrors({});
                setError(stryMutAct_9fa48("463") ? "Stryker was here!" : (stryCov_9fa48("463"), ''));
              }
            }} className="flex-1 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/25 transition-colors">
                {acc.label}
              </button>))}
          </div>
          <p className="mt-3 text-xs text-indigo-300">
            PIN <span className="font-medium text-indigo-100">1234</span> · resets daily
          </p>
        </div>
      </div>
    </div>;
  }
}