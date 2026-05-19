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
import { walletApi } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Wallet, LogOut } from 'lucide-react';
import { formatKES } from '../lib/money';
export function ProfilePage() {
  if (stryMutAct_9fa48("467")) {
    {}
  } else {
    stryCov_9fa48("467");
    const {
      fullName,
      phone,
      logout
    } = useAuth();
    const {
      data: wallet
    } = useQuery(stryMutAct_9fa48("468") ? {} : (stryCov_9fa48("468"), {
      queryKey: stryMutAct_9fa48("469") ? [] : (stryCov_9fa48("469"), [stryMutAct_9fa48("470") ? "" : (stryCov_9fa48("470"), 'wallet')]),
      queryFn: stryMutAct_9fa48("471") ? () => undefined : (stryCov_9fa48("471"), () => walletApi.getWallet().then(stryMutAct_9fa48("472") ? () => undefined : (stryCov_9fa48("472"), r => r.data.data)))
    }));
    const details = stryMutAct_9fa48("473") ? [] : (stryCov_9fa48("473"), [stryMutAct_9fa48("474") ? {} : (stryCov_9fa48("474"), {
      icon: Phone,
      label: stryMutAct_9fa48("475") ? "" : (stryCov_9fa48("475"), 'Phone Number'),
      value: stryMutAct_9fa48("478") ? wallet?.phoneNumber && phone : stryMutAct_9fa48("477") ? false : stryMutAct_9fa48("476") ? true : (stryCov_9fa48("476", "477", "478"), (stryMutAct_9fa48("479") ? wallet.phoneNumber : (stryCov_9fa48("479"), wallet?.phoneNumber)) || phone)
    }), stryMutAct_9fa48("480") ? {} : (stryCov_9fa48("480"), {
      icon: Wallet,
      label: stryMutAct_9fa48("481") ? "" : (stryCov_9fa48("481"), 'Wallet Balance'),
      value: wallet ? formatKES(wallet.balance) : stryMutAct_9fa48("482") ? "" : (stryCov_9fa48("482"), 'Loading...')
    }), stryMutAct_9fa48("483") ? {} : (stryCov_9fa48("483"), {
      icon: Wallet,
      label: stryMutAct_9fa48("484") ? "" : (stryCov_9fa48("484"), 'Daily Transfer Limit'),
      value: wallet ? formatKES(wallet.dailyTransferLimit) : stryMutAct_9fa48("485") ? "" : (stryCov_9fa48("485"), '-')
    })]);
    return <div className="px-6 pt-6 lg:px-0 lg:pt-4">
      <h2 className="text-xl font-bold text-gray-900 mb-6 lg:text-2xl">Profile</h2>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
        {/* Identity card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 lg:mb-0 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={28} className="text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-gray-900 truncate">{fullName}</p>
              <p className="text-sm text-gray-500 truncate">{phone}</p>
            </div>
          </div>
          <button onClick={logout} className="mt-6 w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-2xl font-medium hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Account details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Account details</h3>
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {details.map(stryMutAct_9fa48("486") ? () => undefined : (stryCov_9fa48("486"), ({
              icon: Icon,
              label,
              value
            }) => <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Icon size={18} className="text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium truncate">{value}</p>
                </div>
              </div>))}
          </div>
        </div>
      </div>
    </div>;
  }
}