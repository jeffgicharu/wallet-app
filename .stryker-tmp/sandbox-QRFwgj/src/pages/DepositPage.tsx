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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/wallet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatKES } from '../lib/money';
import { newIdempotencyKey } from '../lib/idempotency';
import { useIsDesktop } from '../lib/useMediaQuery';
export function DepositPage() {
  if (stryMutAct_9fa48("137")) {
    {}
  } else {
    stryCov_9fa48("137");
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isDesktop = useIsDesktop();
    const [amount, setAmount] = useState(stryMutAct_9fa48("138") ? "Stryker was here!" : (stryCov_9fa48("138"), ''));
    const [done, setDone] = useState(stryMutAct_9fa48("139") ? true : (stryCov_9fa48("139"), false));
    // Stable for this deposit attempt so a retry replays rather than
    // double-credits; the backend prefixes it as DEP-{key}.
    const [idemKey] = useState(newIdempotencyKey);
    const {
      data: wallet
    } = useQuery(stryMutAct_9fa48("140") ? {} : (stryCov_9fa48("140"), {
      queryKey: stryMutAct_9fa48("141") ? [] : (stryCov_9fa48("141"), [stryMutAct_9fa48("142") ? "" : (stryCov_9fa48("142"), 'wallet')]),
      queryFn: stryMutAct_9fa48("143") ? () => undefined : (stryCov_9fa48("143"), () => walletApi.getWallet().then(stryMutAct_9fa48("144") ? () => undefined : (stryCov_9fa48("144"), r => r.data.data))),
      staleTime: 15_000
    }));
    const mutation = useMutation(stryMutAct_9fa48("145") ? {} : (stryCov_9fa48("145"), {
      mutationFn: stryMutAct_9fa48("146") ? () => undefined : (stryCov_9fa48("146"), () => walletApi.deposit(parseFloat(amount), idemKey)),
      onSuccess: () => {
        if (stryMutAct_9fa48("147")) {
          {}
        } else {
          stryCov_9fa48("147");
          setDone(stryMutAct_9fa48("148") ? false : (stryCov_9fa48("148"), true));
          queryClient.invalidateQueries(stryMutAct_9fa48("149") ? {} : (stryCov_9fa48("149"), {
            queryKey: stryMutAct_9fa48("150") ? [] : (stryCov_9fa48("150"), [stryMutAct_9fa48("151") ? "" : (stryCov_9fa48("151"), 'wallet')])
          }));
        }
      },
      onError: stryMutAct_9fa48("152") ? () => undefined : (stryCov_9fa48("152"), (err: any) => toast.error(stryMutAct_9fa48("155") ? err.response?.data?.message && 'Deposit failed' : stryMutAct_9fa48("154") ? false : stryMutAct_9fa48("153") ? true : (stryCov_9fa48("153", "154", "155"), (stryMutAct_9fa48("157") ? err.response.data?.message : stryMutAct_9fa48("156") ? err.response?.data.message : (stryCov_9fa48("156", "157"), err.response?.data?.message)) || (stryMutAct_9fa48("158") ? "" : (stryCov_9fa48("158"), 'Deposit failed')))))
    }));
    if (stryMutAct_9fa48("160") ? false : stryMutAct_9fa48("159") ? true : (stryCov_9fa48("159", "160"), done)) {
      if (stryMutAct_9fa48("161")) {
        {}
      } else {
        stryCov_9fa48("161");
        return <div className="px-6 pt-16 text-center lg:pt-24">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Deposit Successful</h3>
        <p className="text-gray-500">{formatKES(parseFloat(amount))} deposited</p>
        <button onClick={stryMutAct_9fa48("162") ? () => undefined : (stryCov_9fa48("162"), () => navigate(stryMutAct_9fa48("163") ? "" : (stryCov_9fa48("163"), '/')))} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-medium">Done</button>
      </div>;
      }
    }
    const form = <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
      <input type="number" value={amount} onChange={stryMutAct_9fa48("164") ? () => undefined : (stryCov_9fa48("164"), e => setAmount(e.target.value))} placeholder="0.00" autoFocus className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl text-2xl text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
      <div className="flex gap-2 mt-4">
        {(stryMutAct_9fa48("165") ? [] : (stryCov_9fa48("165"), [500, 1000, 5000, 10000])).map(stryMutAct_9fa48("166") ? () => undefined : (stryCov_9fa48("166"), v => <button key={v} onClick={stryMutAct_9fa48("167") ? () => undefined : (stryCov_9fa48("167"), () => setAmount(String(v)))} className="flex-1 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">{v.toLocaleString()}</button>))}
      </div>
      <button onClick={stryMutAct_9fa48("168") ? () => undefined : (stryCov_9fa48("168"), () => mutation.mutate())} disabled={stryMutAct_9fa48("171") ? (!amount || parseFloat(amount) < 1) && mutation.isPending : stryMutAct_9fa48("170") ? false : stryMutAct_9fa48("169") ? true : (stryCov_9fa48("169", "170", "171"), (stryMutAct_9fa48("173") ? !amount && parseFloat(amount) < 1 : stryMutAct_9fa48("172") ? false : (stryCov_9fa48("172", "173"), (stryMutAct_9fa48("174") ? amount : (stryCov_9fa48("174"), !amount)) || (stryMutAct_9fa48("177") ? parseFloat(amount) >= 1 : stryMutAct_9fa48("176") ? parseFloat(amount) <= 1 : stryMutAct_9fa48("175") ? false : (stryCov_9fa48("175", "176", "177"), parseFloat(amount) < 1)))) || mutation.isPending)} className="w-full mt-6 py-3.5 bg-green-600 text-white rounded-2xl font-medium disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
        {mutation.isPending ? stryMutAct_9fa48("178") ? "" : (stryCov_9fa48("178"), 'Processing...') : stryMutAct_9fa48("179") ? "" : (stryCov_9fa48("179"), 'Deposit')}
      </button>
    </div>;
    return <div className="px-6 pt-6 lg:px-0 lg:pt-4">
      <button onClick={stryMutAct_9fa48("180") ? () => undefined : (stryCov_9fa48("180"), () => navigate(stryMutAct_9fa48("181") ? "" : (stryCov_9fa48("181"), '/')))} className="flex items-center gap-2 text-gray-500 text-sm mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
        <ArrowLeft size={16} /> Home
      </button>
      <h2 className="text-xl font-bold text-gray-900 mb-6 lg:text-2xl">Deposit Money</h2>
      <div className="lg:grid lg:grid-cols-[minmax(0,30rem)_1fr] lg:gap-8 lg:items-start">
        <div className="lg:rounded-2xl lg:border lg:border-gray-100 lg:bg-white lg:p-8">
          {form}
        </div>
        {stryMutAct_9fa48("184") ? isDesktop || <aside className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Current balance</dt>
                <dd className="font-medium text-gray-900">{wallet ? formatKES(wallet.balance) : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">After this deposit</dt>
                <dd className="font-medium text-gray-900">
                  {wallet && amount && parseFloat(amount) > 0 ? formatKES(wallet.balance + parseFloat(amount)) : '—'}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-gray-400">
              Deposits are credited instantly. No fee is charged on deposits.
            </p>
          </aside> : stryMutAct_9fa48("183") ? false : stryMutAct_9fa48("182") ? true : (stryCov_9fa48("182", "183", "184"), isDesktop && <aside className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Current balance</dt>
                <dd className="font-medium text-gray-900">{wallet ? formatKES(wallet.balance) : stryMutAct_9fa48("185") ? "" : (stryCov_9fa48("185"), '—')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">After this deposit</dt>
                <dd className="font-medium text-gray-900">
                  {(stryMutAct_9fa48("188") ? wallet && amount || parseFloat(amount) > 0 : stryMutAct_9fa48("187") ? false : stryMutAct_9fa48("186") ? true : (stryCov_9fa48("186", "187", "188"), (stryMutAct_9fa48("190") ? wallet || amount : stryMutAct_9fa48("189") ? true : (stryCov_9fa48("189", "190"), wallet && amount)) && (stryMutAct_9fa48("193") ? parseFloat(amount) <= 0 : stryMutAct_9fa48("192") ? parseFloat(amount) >= 0 : stryMutAct_9fa48("191") ? true : (stryCov_9fa48("191", "192", "193"), parseFloat(amount) > 0)))) ? formatKES(stryMutAct_9fa48("194") ? wallet.balance - parseFloat(amount) : (stryCov_9fa48("194"), wallet.balance + parseFloat(amount))) : stryMutAct_9fa48("195") ? "" : (stryCov_9fa48("195"), '—')}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-gray-400">
              Deposits are credited instantly. No fee is charged on deposits.
            </p>
          </aside>)}
      </div>
    </div>;
  }
}