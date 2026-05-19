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
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { walletApi } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
import { Send, Download, Upload, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { formatKES, formatSignedKES } from '../lib/money';
import { direction, isFeeRow, transactionLabel } from '../lib/transactions';
export function HomePage() {
  if (stryMutAct_9fa48("309")) {
    {}
  } else {
    stryCov_9fa48("309");
    const navigate = useNavigate();
    const {
      fullName,
      phone
    } = useAuth();
    const [showBalance, setShowBalance] = useState(stryMutAct_9fa48("310") ? false : (stryCov_9fa48("310"), true));
    const {
      data: wallet,
      isLoading
    } = useQuery(stryMutAct_9fa48("311") ? {} : (stryCov_9fa48("311"), {
      queryKey: stryMutAct_9fa48("312") ? [] : (stryCov_9fa48("312"), [stryMutAct_9fa48("313") ? "" : (stryCov_9fa48("313"), 'wallet')]),
      queryFn: stryMutAct_9fa48("314") ? () => undefined : (stryCov_9fa48("314"), () => walletApi.getWallet().then(stryMutAct_9fa48("315") ? () => undefined : (stryCov_9fa48("315"), r => r.data.data))),
      refetchInterval: 30000
    }));

    // Fetch a few extra so that, after folding out standalone FEE rows,
    // there are still up to 5 real transactions to show.
    const {
      data: txns
    } = useQuery(stryMutAct_9fa48("316") ? {} : (stryCov_9fa48("316"), {
      queryKey: stryMutAct_9fa48("317") ? [] : (stryCov_9fa48("317"), [stryMutAct_9fa48("318") ? "" : (stryCov_9fa48("318"), 'recent-txns')]),
      queryFn: stryMutAct_9fa48("319") ? () => undefined : (stryCov_9fa48("319"), () => walletApi.getTransactions(0, 10).then(stryMutAct_9fa48("320") ? () => undefined : (stryCov_9fa48("320"), r => stryMutAct_9fa48("322") ? r.data.data.content.slice(0, 5) : stryMutAct_9fa48("321") ? r.data.data.content.filter(t => !isFeeRow(t)) : (stryCov_9fa48("321", "322"), r.data.data.content.filter(stryMutAct_9fa48("323") ? () => undefined : (stryCov_9fa48("323"), t => stryMutAct_9fa48("324") ? isFeeRow(t) : (stryCov_9fa48("324"), !isFeeRow(t)))).slice(0, 5)))))
    }));
    const myPhone = stryMutAct_9fa48("325") ? wallet?.phoneNumber && phone : (stryCov_9fa48("325"), (stryMutAct_9fa48("326") ? wallet.phoneNumber : (stryCov_9fa48("326"), wallet?.phoneNumber)) ?? phone);
    const fmtDate = stryMutAct_9fa48("327") ? () => undefined : (stryCov_9fa48("327"), (() => {
      const fmtDate = (d: string) => new Date(d).toLocaleDateString(stryMutAct_9fa48("328") ? "" : (stryCov_9fa48("328"), 'en-KE'), stryMutAct_9fa48("329") ? {} : (stryCov_9fa48("329"), {
        day: stryMutAct_9fa48("330") ? "" : (stryCov_9fa48("330"), 'numeric'),
        month: stryMutAct_9fa48("331") ? "" : (stryCov_9fa48("331"), 'short')
      }));
      return fmtDate;
    })());
    const actions = stryMutAct_9fa48("332") ? [] : (stryCov_9fa48("332"), [stryMutAct_9fa48("333") ? {} : (stryCov_9fa48("333"), {
      label: stryMutAct_9fa48("334") ? "" : (stryCov_9fa48("334"), 'Send'),
      icon: Send,
      path: stryMutAct_9fa48("335") ? "" : (stryCov_9fa48("335"), '/send'),
      color: stryMutAct_9fa48("336") ? "" : (stryCov_9fa48("336"), 'bg-blue-100 text-blue-600')
    }), stryMutAct_9fa48("337") ? {} : (stryCov_9fa48("337"), {
      label: stryMutAct_9fa48("338") ? "" : (stryCov_9fa48("338"), 'Deposit'),
      icon: Download,
      path: stryMutAct_9fa48("339") ? "" : (stryCov_9fa48("339"), '/deposit'),
      color: stryMutAct_9fa48("340") ? "" : (stryCov_9fa48("340"), 'bg-green-100 text-green-600')
    }), stryMutAct_9fa48("341") ? {} : (stryCov_9fa48("341"), {
      label: stryMutAct_9fa48("342") ? "" : (stryCov_9fa48("342"), 'Withdraw'),
      icon: Upload,
      path: stryMutAct_9fa48("343") ? "" : (stryCov_9fa48("343"), '/withdraw'),
      color: stryMutAct_9fa48("344") ? "" : (stryCov_9fa48("344"), 'bg-orange-100 text-orange-600')
    })]);
    return <div>
      {/* Top: balance + quick actions. Stacked on mobile (the gradient
          banner spans full width and the actions card overlaps it);
          a 3-column row on desktop so the horizontal space is used. */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-b-3xl lg:rounded-2xl px-6 pt-10 pb-8 lg:p-8 text-white lg:flex lg:flex-col lg:justify-between lg:min-h-[15rem]">
          <div>
            <p className="text-sm text-indigo-200">Hello, {stryMutAct_9fa48("347") ? fullName?.split(' ')[0] && 'there' : stryMutAct_9fa48("346") ? false : stryMutAct_9fa48("345") ? true : (stryCov_9fa48("345", "346", "347"), (stryMutAct_9fa48("348") ? fullName.split(' ')[0] : (stryCov_9fa48("348"), fullName?.split(stryMutAct_9fa48("349") ? "" : (stryCov_9fa48("349"), ' '))[0])) || (stryMutAct_9fa48("350") ? "" : (stryCov_9fa48("350"), 'there')))}</p>
            <div className="flex items-center gap-3 mt-2 lg:mt-4">
              <div>
                <p className="text-xs text-indigo-300 mb-1">Available Balance</p>
                {isLoading ? <div className="h-8 w-40 bg-indigo-500 rounded animate-pulse" /> : <p className="text-3xl lg:text-5xl font-bold">
                    {showBalance ? formatKES(stryMutAct_9fa48("351") ? wallet.balance : (stryCov_9fa48("351"), wallet?.balance)) : stryMutAct_9fa48("352") ? "" : (stryCov_9fa48("352"), 'KES ****')}
                  </p>}
              </div>
              <button onClick={stryMutAct_9fa48("353") ? () => undefined : (stryCov_9fa48("353"), () => setShowBalance(stryMutAct_9fa48("354") ? showBalance : (stryCov_9fa48("354"), !showBalance)))} aria-label={showBalance ? stryMutAct_9fa48("355") ? "" : (stryCov_9fa48("355"), 'Hide balance') : stryMutAct_9fa48("356") ? "" : (stryCov_9fa48("356"), 'Show balance')} className="ml-auto p-2 rounded-full bg-indigo-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {stryMutAct_9fa48("359") ? wallet || <p className="text-xs text-indigo-300 mt-3 lg:mt-0 lg:text-sm">
              Daily limit: {formatKES(wallet.dailyTransferLimit)} (used: {formatKES(wallet.dailyTransferUsed)})
            </p> : stryMutAct_9fa48("358") ? false : stryMutAct_9fa48("357") ? true : (stryCov_9fa48("357", "358", "359"), wallet && <p className="text-xs text-indigo-300 mt-3 lg:mt-0 lg:text-sm">
              Daily limit: {formatKES(wallet.dailyTransferLimit)} (used: {formatKES(wallet.dailyTransferUsed)})
            </p>)}
        </div>

        {/* Quick Actions */}
        <div className="px-6 -mt-5 lg:mt-0 lg:px-0 lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid grid-cols-3 gap-4 lg:grid-cols-1 lg:gap-2 lg:h-full lg:content-center">
            {actions.map(stryMutAct_9fa48("360") ? () => undefined : (stryCov_9fa48("360"), ({
              label,
              icon: Icon,
              path,
              color
            }) => <button key={label} onClick={stryMutAct_9fa48("361") ? () => undefined : (stryCov_9fa48("361"), () => navigate(path))} className="flex flex-col items-center gap-2 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:flex-row lg:justify-start lg:gap-4 lg:px-4">
                <div className={stryMutAct_9fa48("362") ? `` : (stryCov_9fa48("362"), `w-12 h-12 rounded-full flex items-center justify-center ${color}`)}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium text-gray-700 lg:text-sm">{label}</span>
              </button>))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6 mt-6 lg:px-0 lg:mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 lg:text-base">Recent Transactions</h3>
          <button onClick={stryMutAct_9fa48("363") ? () => undefined : (stryCov_9fa48("363"), () => navigate(stryMutAct_9fa48("364") ? "" : (stryCov_9fa48("364"), '/history')))} className="text-xs text-indigo-600 font-medium lg:text-sm">See All</button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {(stryMutAct_9fa48("367") ? txns && [] : stryMutAct_9fa48("366") ? false : stryMutAct_9fa48("365") ? true : (stryCov_9fa48("365", "366", "367"), txns || (stryMutAct_9fa48("368") ? ["Stryker was here"] : (stryCov_9fa48("368"), [])))).map(t => {
            if (stryMutAct_9fa48("369")) {
              {}
            } else {
              stryCov_9fa48("369");
              const dir = direction(t, myPhone);
              const color = (stryMutAct_9fa48("372") ? dir !== 'out' : stryMutAct_9fa48("371") ? false : stryMutAct_9fa48("370") ? true : (stryCov_9fa48("370", "371", "372"), dir === (stryMutAct_9fa48("373") ? "" : (stryCov_9fa48("373"), 'out')))) ? stryMutAct_9fa48("374") ? "" : (stryCov_9fa48("374"), 'text-red-500') : stryMutAct_9fa48("375") ? "" : (stryCov_9fa48("375"), 'text-green-500');
              return <button key={t.reference} onClick={stryMutAct_9fa48("376") ? () => undefined : (stryCov_9fa48("376"), () => navigate(stryMutAct_9fa48("377") ? `` : (stryCov_9fa48("377"), `/history/${t.reference}`)))} className="flex items-center gap-3 p-4 lg:px-6 w-full text-left hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                <div className={stryMutAct_9fa48("378") ? `` : (stryCov_9fa48("378"), `w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${color} bg-gray-50`)}>
                  {(stryMutAct_9fa48("381") ? dir !== 'out' : stryMutAct_9fa48("380") ? false : stryMutAct_9fa48("379") ? true : (stryCov_9fa48("379", "380", "381"), dir === (stryMutAct_9fa48("382") ? "" : (stryCov_9fa48("382"), 'out')))) ? stryMutAct_9fa48("383") ? "" : (stryCov_9fa48("383"), '-') : stryMutAct_9fa48("384") ? "" : (stryCov_9fa48("384"), '+')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{transactionLabel(t, myPhone)}</p>
                  <p className="text-xs text-gray-400">{fmtDate(t.createdAt)}</p>
                </div>
                <p className={stryMutAct_9fa48("385") ? `` : (stryCov_9fa48("385"), `text-sm font-semibold ${color}`)}>
                  {formatSignedKES(t.amount, dir)}
                </p>
              </button>;
            }
          })}
          {stryMutAct_9fa48("388") ? !txns || txns.length === 0 || <p className="text-center py-8 text-gray-400 text-sm">No transactions yet</p> : stryMutAct_9fa48("387") ? false : stryMutAct_9fa48("386") ? true : (stryCov_9fa48("386", "387", "388"), (stryMutAct_9fa48("390") ? !txns && txns.length === 0 : stryMutAct_9fa48("389") ? true : (stryCov_9fa48("389", "390"), (stryMutAct_9fa48("391") ? txns : (stryCov_9fa48("391"), !txns)) || (stryMutAct_9fa48("393") ? txns.length !== 0 : stryMutAct_9fa48("392") ? false : (stryCov_9fa48("392", "393"), txns.length === 0)))) && <p className="text-center py-8 text-gray-400 text-sm">No transactions yet</p>)}
        </div>
      </div>
    </div>;
  }
}