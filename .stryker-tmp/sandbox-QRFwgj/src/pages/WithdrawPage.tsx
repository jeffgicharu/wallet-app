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
import { PinPad } from '../components/PinPad';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatKES } from '../lib/money';
import { newIdempotencyKey } from '../lib/idempotency';
import { useIsDesktop } from '../lib/useMediaQuery';
export function WithdrawPage() {
  if (stryMutAct_9fa48("658")) {
    {}
  } else {
    stryCov_9fa48("658");
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isDesktop = useIsDesktop();
    const [amount, setAmount] = useState(stryMutAct_9fa48("659") ? "Stryker was here!" : (stryCov_9fa48("659"), ''));
    const [showPin, setShowPin] = useState(stryMutAct_9fa48("660") ? true : (stryCov_9fa48("660"), false));
    const [done, setDone] = useState(stryMutAct_9fa48("661") ? true : (stryCov_9fa48("661"), false));
    // Stable for this withdrawal attempt so a retry replays rather than
    // double-debits; the backend prefixes it as WDR-{key}.
    const [idemKey] = useState(newIdempotencyKey);
    const {
      data: wallet
    } = useQuery(stryMutAct_9fa48("662") ? {} : (stryCov_9fa48("662"), {
      queryKey: stryMutAct_9fa48("663") ? [] : (stryCov_9fa48("663"), [stryMutAct_9fa48("664") ? "" : (stryCov_9fa48("664"), 'wallet')]),
      queryFn: stryMutAct_9fa48("665") ? () => undefined : (stryCov_9fa48("665"), () => walletApi.getWallet().then(stryMutAct_9fa48("666") ? () => undefined : (stryCov_9fa48("666"), r => r.data.data))),
      staleTime: 15_000
    }));
    const mutation = useMutation(stryMutAct_9fa48("667") ? {} : (stryCov_9fa48("667"), {
      mutationFn: stryMutAct_9fa48("668") ? () => undefined : (stryCov_9fa48("668"), (pin: string) => walletApi.withdraw(parseFloat(amount), pin, idemKey)),
      onSuccess: () => {
        if (stryMutAct_9fa48("669")) {
          {}
        } else {
          stryCov_9fa48("669");
          setDone(stryMutAct_9fa48("670") ? false : (stryCov_9fa48("670"), true));
          queryClient.invalidateQueries(stryMutAct_9fa48("671") ? {} : (stryCov_9fa48("671"), {
            queryKey: stryMutAct_9fa48("672") ? [] : (stryCov_9fa48("672"), [stryMutAct_9fa48("673") ? "" : (stryCov_9fa48("673"), 'wallet')])
          }));
        }
      },
      onError: (err: any) => {
        if (stryMutAct_9fa48("674")) {
          {}
        } else {
          stryCov_9fa48("674");
          toast.error(stryMutAct_9fa48("677") ? err.response?.data?.message && 'Withdrawal failed' : stryMutAct_9fa48("676") ? false : stryMutAct_9fa48("675") ? true : (stryCov_9fa48("675", "676", "677"), (stryMutAct_9fa48("679") ? err.response.data?.message : stryMutAct_9fa48("678") ? err.response?.data.message : (stryCov_9fa48("678", "679"), err.response?.data?.message)) || (stryMutAct_9fa48("680") ? "" : (stryCov_9fa48("680"), 'Withdrawal failed'))));
          setShowPin(stryMutAct_9fa48("681") ? true : (stryCov_9fa48("681"), false));
        }
      }
    }));
    if (stryMutAct_9fa48("683") ? false : stryMutAct_9fa48("682") ? true : (stryCov_9fa48("682", "683"), done)) {
      if (stryMutAct_9fa48("684")) {
        {}
      } else {
        stryCov_9fa48("684");
        return <div className="px-6 pt-16 text-center lg:pt-24">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Successful</h3>
        <p className="text-gray-500">{formatKES(parseFloat(amount))} withdrawn</p>
        <button onClick={stryMutAct_9fa48("685") ? () => undefined : (stryCov_9fa48("685"), () => navigate(stryMutAct_9fa48("686") ? "" : (stryCov_9fa48("686"), '/')))} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-medium">Done</button>
      </div>;
      }
    }
    const amountNum = parseFloat(amount);
    const form = <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
      <input type="number" value={amount} onChange={stryMutAct_9fa48("687") ? () => undefined : (stryCov_9fa48("687"), e => setAmount(e.target.value))} placeholder="0.00" autoFocus className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl text-2xl text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
      <button onClick={stryMutAct_9fa48("688") ? () => undefined : (stryCov_9fa48("688"), () => setShowPin(stryMutAct_9fa48("689") ? false : (stryCov_9fa48("689"), true)))} disabled={stryMutAct_9fa48("692") ? !amount && amountNum < 10 : stryMutAct_9fa48("691") ? false : stryMutAct_9fa48("690") ? true : (stryCov_9fa48("690", "691", "692"), (stryMutAct_9fa48("693") ? amount : (stryCov_9fa48("693"), !amount)) || (stryMutAct_9fa48("696") ? amountNum >= 10 : stryMutAct_9fa48("695") ? amountNum <= 10 : stryMutAct_9fa48("694") ? false : (stryCov_9fa48("694", "695", "696"), amountNum < 10)))} className="w-full mt-6 py-3.5 bg-orange-600 text-white rounded-2xl font-medium disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
        Withdraw
      </button>
      {stryMutAct_9fa48("699") ? showPin || <PinPad title="Enter PIN to withdraw" onComplete={pin => mutation.mutate(pin)} onCancel={() => setShowPin(false)} loading={mutation.isPending} /> : stryMutAct_9fa48("698") ? false : stryMutAct_9fa48("697") ? true : (stryCov_9fa48("697", "698", "699"), showPin && <PinPad title="Enter PIN to withdraw" onComplete={stryMutAct_9fa48("700") ? () => undefined : (stryCov_9fa48("700"), pin => mutation.mutate(pin))} onCancel={stryMutAct_9fa48("701") ? () => undefined : (stryCov_9fa48("701"), () => setShowPin(stryMutAct_9fa48("702") ? true : (stryCov_9fa48("702"), false)))} loading={mutation.isPending} />)}
    </div>;
    return <div className="px-6 pt-6 lg:px-0 lg:pt-4">
      <button onClick={stryMutAct_9fa48("703") ? () => undefined : (stryCov_9fa48("703"), () => navigate(stryMutAct_9fa48("704") ? "" : (stryCov_9fa48("704"), '/')))} className="flex items-center gap-2 text-gray-500 text-sm mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
        <ArrowLeft size={16} /> Home
      </button>
      <h2 className="text-xl font-bold text-gray-900 mb-6 lg:text-2xl">Withdraw Money</h2>
      <div className="lg:grid lg:grid-cols-[minmax(0,30rem)_1fr] lg:gap-8 lg:items-start">
        <div className="lg:rounded-2xl lg:border lg:border-gray-100 lg:bg-white lg:p-8">
          {form}
        </div>
        {stryMutAct_9fa48("707") ? isDesktop || <aside className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Available balance</dt>
                <dd className="font-medium text-gray-900">{wallet ? formatKES(wallet.balance) : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">After this withdrawal</dt>
                <dd className="font-medium text-gray-900">
                  {wallet && amount && amountNum > 0 ? formatKES(wallet.balance - amountNum) : '—'}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-gray-400">
              Minimum withdrawal is {formatKES(10)}. You'll confirm with your PIN.
            </p>
          </aside> : stryMutAct_9fa48("706") ? false : stryMutAct_9fa48("705") ? true : (stryCov_9fa48("705", "706", "707"), isDesktop && <aside className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Available balance</dt>
                <dd className="font-medium text-gray-900">{wallet ? formatKES(wallet.balance) : stryMutAct_9fa48("708") ? "" : (stryCov_9fa48("708"), '—')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">After this withdrawal</dt>
                <dd className="font-medium text-gray-900">
                  {(stryMutAct_9fa48("711") ? wallet && amount || amountNum > 0 : stryMutAct_9fa48("710") ? false : stryMutAct_9fa48("709") ? true : (stryCov_9fa48("709", "710", "711"), (stryMutAct_9fa48("713") ? wallet || amount : stryMutAct_9fa48("712") ? true : (stryCov_9fa48("712", "713"), wallet && amount)) && (stryMutAct_9fa48("716") ? amountNum <= 0 : stryMutAct_9fa48("715") ? amountNum >= 0 : stryMutAct_9fa48("714") ? true : (stryCov_9fa48("714", "715", "716"), amountNum > 0)))) ? formatKES(stryMutAct_9fa48("717") ? wallet.balance + amountNum : (stryCov_9fa48("717"), wallet.balance - amountNum)) : stryMutAct_9fa48("718") ? "" : (stryCov_9fa48("718"), '—')}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-gray-400">
              Minimum withdrawal is {formatKES(10)}. You'll confirm with your PIN.
            </p>
          </aside>)}
      </div>
    </div>;
  }
}