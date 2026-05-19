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
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatKES } from '../lib/money';
import { newIdempotencyKey } from '../lib/idempotency';
import { useIsDesktop } from '../lib/useMediaQuery';
type Step = 'phone' | 'amount' | 'confirm' | 'pin' | 'success';

// wallet-api charges a 1% transfer fee (wallet.transfer-fee-percent in
// application.yml). Mirror the rate here so the confirm step can preview
// the fee before the user signs the PIN. If the backend rate changes,
// this is the one place to update on the client.
const TRANSFER_FEE_RATE = 0.01;
const round2 = stryMutAct_9fa48("487") ? () => undefined : (stryCov_9fa48("487"), (() => {
  const round2 = (n: number) => stryMutAct_9fa48("488") ? Math.round(n * 100) * 100 : (stryCov_9fa48("488"), Math.round(stryMutAct_9fa48("489") ? n / 100 : (stryCov_9fa48("489"), n * 100)) / 100);
  return round2;
})());
export function SendPage() {
  if (stryMutAct_9fa48("490")) {
    {}
  } else {
    stryCov_9fa48("490");
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isDesktop = useIsDesktop();
    const [step, setStep] = useState<Step>(stryMutAct_9fa48("491") ? "" : (stryCov_9fa48("491"), 'phone'));
    const [phone, setPhone] = useState(stryMutAct_9fa48("492") ? "Stryker was here!" : (stryCov_9fa48("492"), ''));
    const [amount, setAmount] = useState(stryMutAct_9fa48("493") ? "Stryker was here!" : (stryCov_9fa48("493"), ''));
    const [reference, setReference] = useState(stryMutAct_9fa48("494") ? "Stryker was here!" : (stryCov_9fa48("494"), ''));
    // One key per confirmed intent: stable across PIN retries (a
    // lost-response retry replays the original transfer instead of
    // double-charging), regenerated when the user re-confirms a changed
    // amount/recipient. The backend prefixes it as TRF-{key}.
    const [idemKey, setIdemKey] = useState(stryMutAct_9fa48("495") ? "Stryker was here!" : (stryCov_9fa48("495"), ''));

    // Daily transfer limit is enforced server-side (wallet.daily-transfer-limit
    // in wallet-api). Read the current usage so we can show a "Remaining today"
    // hint and disable Continue if the entered amount + fee would exceed it.
    const {
      data: wallet
    } = useQuery(stryMutAct_9fa48("496") ? {} : (stryCov_9fa48("496"), {
      queryKey: stryMutAct_9fa48("497") ? [] : (stryCov_9fa48("497"), [stryMutAct_9fa48("498") ? "" : (stryCov_9fa48("498"), 'wallet')]),
      queryFn: stryMutAct_9fa48("499") ? () => undefined : (stryCov_9fa48("499"), () => walletApi.getWallet().then(stryMutAct_9fa48("500") ? () => undefined : (stryCov_9fa48("500"), r => r.data.data))),
      staleTime: 15_000
    }));
    const mutation = useMutation(stryMutAct_9fa48("501") ? {} : (stryCov_9fa48("501"), {
      mutationFn: stryMutAct_9fa48("502") ? () => undefined : (stryCov_9fa48("502"), (pin: string) => walletApi.transfer((stryMutAct_9fa48("503") ? phone.endsWith('0') : (stryCov_9fa48("503"), phone.startsWith(stryMutAct_9fa48("504") ? "" : (stryCov_9fa48("504"), '0')))) ? (stryMutAct_9fa48("505") ? "" : (stryCov_9fa48("505"), '+254')) + (stryMutAct_9fa48("506") ? phone : (stryCov_9fa48("506"), phone.substring(1))) : phone, parseFloat(amount), pin, idemKey)),
      onSuccess: res => {
        if (stryMutAct_9fa48("507")) {
          {}
        } else {
          stryCov_9fa48("507");
          setReference(res.data.data.reference);
          setStep(stryMutAct_9fa48("508") ? "" : (stryCov_9fa48("508"), 'success'));
          queryClient.invalidateQueries(stryMutAct_9fa48("509") ? {} : (stryCov_9fa48("509"), {
            queryKey: stryMutAct_9fa48("510") ? [] : (stryCov_9fa48("510"), [stryMutAct_9fa48("511") ? "" : (stryCov_9fa48("511"), 'wallet')])
          }));
          queryClient.invalidateQueries(stryMutAct_9fa48("512") ? {} : (stryCov_9fa48("512"), {
            queryKey: stryMutAct_9fa48("513") ? [] : (stryCov_9fa48("513"), [stryMutAct_9fa48("514") ? "" : (stryCov_9fa48("514"), 'recent-txns')])
          }));
        }
      },
      onError: (err: any) => {
        if (stryMutAct_9fa48("515")) {
          {}
        } else {
          stryCov_9fa48("515");
          toast.error(stryMutAct_9fa48("518") ? err.response?.data?.message && 'Transfer failed' : stryMutAct_9fa48("517") ? false : stryMutAct_9fa48("516") ? true : (stryCov_9fa48("516", "517", "518"), (stryMutAct_9fa48("520") ? err.response.data?.message : stryMutAct_9fa48("519") ? err.response?.data.message : (stryCov_9fa48("519", "520"), err.response?.data?.message)) || (stryMutAct_9fa48("521") ? "" : (stryCov_9fa48("521"), 'Transfer failed'))));
          setStep(stryMutAct_9fa48("522") ? "" : (stryCov_9fa48("522"), 'confirm'));
        }
      }
    }));
    const amountNum = parseFloat(amount);
    const liveFee = isNaN(amountNum) ? 0 : round2(stryMutAct_9fa48("523") ? amountNum / TRANSFER_FEE_RATE : (stryCov_9fa48("523"), amountNum * TRANSFER_FEE_RATE));
    const liveTotal = isNaN(amountNum) ? 0 : round2(stryMutAct_9fa48("524") ? amountNum - liveFee : (stryCov_9fa48("524"), amountNum + liveFee));
    const remaining = wallet ? round2(stryMutAct_9fa48("525") ? wallet.dailyTransferLimit + wallet.dailyTransferUsed : (stryCov_9fa48("525"), wallet.dailyTransferLimit - wallet.dailyTransferUsed)) : undefined;
    const stepBody = <>
      {stryMutAct_9fa48("528") ? step === 'phone' || <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Phone Number</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712 345 678" autoFocus className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          <button onClick={() => phone.length >= 10 && setStep('amount')} disabled={phone.length < 10} className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-medium disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            Next
          </button>
        </div> : stryMutAct_9fa48("527") ? false : stryMutAct_9fa48("526") ? true : (stryCov_9fa48("526", "527", "528"), (stryMutAct_9fa48("530") ? step !== 'phone' : stryMutAct_9fa48("529") ? true : (stryCov_9fa48("529", "530"), step === (stryMutAct_9fa48("531") ? "" : (stryCov_9fa48("531"), 'phone')))) && <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Phone Number</label>
          <input type="tel" value={phone} onChange={stryMutAct_9fa48("532") ? () => undefined : (stryCov_9fa48("532"), e => setPhone(e.target.value))} placeholder="0712 345 678" autoFocus className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          <button onClick={stryMutAct_9fa48("533") ? () => undefined : (stryCov_9fa48("533"), () => stryMutAct_9fa48("536") ? phone.length >= 10 || setStep('amount') : stryMutAct_9fa48("535") ? false : stryMutAct_9fa48("534") ? true : (stryCov_9fa48("534", "535", "536"), (stryMutAct_9fa48("539") ? phone.length < 10 : stryMutAct_9fa48("538") ? phone.length > 10 : stryMutAct_9fa48("537") ? true : (stryCov_9fa48("537", "538", "539"), phone.length >= 10)) && setStep(stryMutAct_9fa48("540") ? "" : (stryCov_9fa48("540"), 'amount'))))} disabled={stryMutAct_9fa48("544") ? phone.length >= 10 : stryMutAct_9fa48("543") ? phone.length <= 10 : stryMutAct_9fa48("542") ? false : stryMutAct_9fa48("541") ? true : (stryCov_9fa48("541", "542", "543", "544"), phone.length < 10)} className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-medium disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            Next
          </button>
        </div>)}

      {stryMutAct_9fa48("547") ? step === 'amount' || (() => {
        const projectedFee = isNaN(amountNum) ? 0 : round2(amountNum * TRANSFER_FEE_RATE);
        const projectedDebit = isNaN(amountNum) ? 0 : round2(amountNum + projectedFee);
        const overLimit = remaining !== undefined && !isNaN(amountNum) && projectedDebit > remaining;
        const underMin = !amount || amountNum < 10;
        const disabled = underMin || overLimit;
        return <div>
            <p className="text-sm text-gray-500 mb-4">To: {phone}</p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" autoFocus className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl text-2xl text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
            {remaining !== undefined && <p className="mt-2 text-xs text-gray-500">
                Remaining today: {formatKES(remaining)}{' '}
                <span className="text-gray-400">
                  (limit {formatKES(wallet!.dailyTransferLimit)}, used {formatKES(wallet!.dailyTransferUsed)})
                </span>
              </p>}
            {overLimit && <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={14} /> Amount + 1% fee would exceed today's transfer limit.
              </p>}
            <button onClick={() => {
            if (!disabled) {
              setIdemKey(newIdempotencyKey());
              setStep('confirm');
            }
          }} disabled={disabled} className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-medium disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              Next
            </button>
          </div>;
      })() : stryMutAct_9fa48("546") ? false : stryMutAct_9fa48("545") ? true : (stryCov_9fa48("545", "546", "547"), (stryMutAct_9fa48("549") ? step !== 'amount' : stryMutAct_9fa48("548") ? true : (stryCov_9fa48("548", "549"), step === (stryMutAct_9fa48("550") ? "" : (stryCov_9fa48("550"), 'amount')))) && (() => {
        if (stryMutAct_9fa48("551")) {
          {}
        } else {
          stryCov_9fa48("551");
          const projectedFee = isNaN(amountNum) ? 0 : round2(stryMutAct_9fa48("552") ? amountNum / TRANSFER_FEE_RATE : (stryCov_9fa48("552"), amountNum * TRANSFER_FEE_RATE));
          const projectedDebit = isNaN(amountNum) ? 0 : round2(stryMutAct_9fa48("553") ? amountNum - projectedFee : (stryCov_9fa48("553"), amountNum + projectedFee));
          const overLimit = stryMutAct_9fa48("556") ? remaining !== undefined && !isNaN(amountNum) || projectedDebit > remaining : stryMutAct_9fa48("555") ? false : stryMutAct_9fa48("554") ? true : (stryCov_9fa48("554", "555", "556"), (stryMutAct_9fa48("558") ? remaining !== undefined || !isNaN(amountNum) : stryMutAct_9fa48("557") ? true : (stryCov_9fa48("557", "558"), (stryMutAct_9fa48("560") ? remaining === undefined : stryMutAct_9fa48("559") ? true : (stryCov_9fa48("559", "560"), remaining !== undefined)) && (stryMutAct_9fa48("561") ? isNaN(amountNum) : (stryCov_9fa48("561"), !isNaN(amountNum))))) && (stryMutAct_9fa48("564") ? projectedDebit <= remaining : stryMutAct_9fa48("563") ? projectedDebit >= remaining : stryMutAct_9fa48("562") ? true : (stryCov_9fa48("562", "563", "564"), projectedDebit > remaining)));
          const underMin = stryMutAct_9fa48("567") ? !amount && amountNum < 10 : stryMutAct_9fa48("566") ? false : stryMutAct_9fa48("565") ? true : (stryCov_9fa48("565", "566", "567"), (stryMutAct_9fa48("568") ? amount : (stryCov_9fa48("568"), !amount)) || (stryMutAct_9fa48("571") ? amountNum >= 10 : stryMutAct_9fa48("570") ? amountNum <= 10 : stryMutAct_9fa48("569") ? false : (stryCov_9fa48("569", "570", "571"), amountNum < 10)));
          const disabled = stryMutAct_9fa48("574") ? underMin && overLimit : stryMutAct_9fa48("573") ? false : stryMutAct_9fa48("572") ? true : (stryCov_9fa48("572", "573", "574"), underMin || overLimit);
          return <div>
            <p className="text-sm text-gray-500 mb-4">To: {phone}</p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
            <input type="number" value={amount} onChange={stryMutAct_9fa48("575") ? () => undefined : (stryCov_9fa48("575"), e => setAmount(e.target.value))} placeholder="0.00" autoFocus className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl text-2xl text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
            {stryMutAct_9fa48("578") ? remaining !== undefined || <p className="mt-2 text-xs text-gray-500">
                Remaining today: {formatKES(remaining)}{' '}
                <span className="text-gray-400">
                  (limit {formatKES(wallet!.dailyTransferLimit)}, used {formatKES(wallet!.dailyTransferUsed)})
                </span>
              </p> : stryMutAct_9fa48("577") ? false : stryMutAct_9fa48("576") ? true : (stryCov_9fa48("576", "577", "578"), (stryMutAct_9fa48("580") ? remaining === undefined : stryMutAct_9fa48("579") ? true : (stryCov_9fa48("579", "580"), remaining !== undefined)) && <p className="mt-2 text-xs text-gray-500">
                Remaining today: {formatKES(remaining)}{stryMutAct_9fa48("581") ? "" : (stryCov_9fa48("581"), ' ')}
                <span className="text-gray-400">
                  (limit {formatKES(wallet!.dailyTransferLimit)}, used {formatKES(wallet!.dailyTransferUsed)})
                </span>
              </p>)}
            {stryMutAct_9fa48("584") ? overLimit || <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={14} /> Amount + 1% fee would exceed today's transfer limit.
              </p> : stryMutAct_9fa48("583") ? false : stryMutAct_9fa48("582") ? true : (stryCov_9fa48("582", "583", "584"), overLimit && <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={14} /> Amount + 1% fee would exceed today's transfer limit.
              </p>)}
            <button onClick={() => {
              if (stryMutAct_9fa48("585")) {
                {}
              } else {
                stryCov_9fa48("585");
                if (stryMutAct_9fa48("588") ? false : stryMutAct_9fa48("587") ? true : stryMutAct_9fa48("586") ? disabled : (stryCov_9fa48("586", "587", "588"), !disabled)) {
                  if (stryMutAct_9fa48("589")) {
                    {}
                  } else {
                    stryCov_9fa48("589");
                    setIdemKey(newIdempotencyKey());
                    setStep(stryMutAct_9fa48("590") ? "" : (stryCov_9fa48("590"), 'confirm'));
                  }
                }
              }
            }} disabled={disabled} className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-medium disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              Next
            </button>
          </div>;
        }
      })())}

      {stryMutAct_9fa48("593") ? step === 'confirm' || <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-center mb-6">Confirm Transfer</h3>
          <div className="space-y-4">
            <div className="flex justify-between"><span className="text-gray-500">To</span><span className="font-medium">{phone}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-medium">{formatKES(amountNum)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Fee (1%)</span><span className="font-medium">{formatKES(liveFee)}</span></div>
            <hr />
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="text-lg font-bold">{formatKES(liveTotal)}</span></div>
          </div>
          <button onClick={() => setStep('pin')} className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            Enter PIN to Confirm
          </button>
        </div> : stryMutAct_9fa48("592") ? false : stryMutAct_9fa48("591") ? true : (stryCov_9fa48("591", "592", "593"), (stryMutAct_9fa48("595") ? step !== 'confirm' : stryMutAct_9fa48("594") ? true : (stryCov_9fa48("594", "595"), step === (stryMutAct_9fa48("596") ? "" : (stryCov_9fa48("596"), 'confirm')))) && <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-center mb-6">Confirm Transfer</h3>
          <div className="space-y-4">
            <div className="flex justify-between"><span className="text-gray-500">To</span><span className="font-medium">{phone}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-medium">{formatKES(amountNum)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Fee (1%)</span><span className="font-medium">{formatKES(liveFee)}</span></div>
            <hr />
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="text-lg font-bold">{formatKES(liveTotal)}</span></div>
          </div>
          <button onClick={stryMutAct_9fa48("597") ? () => undefined : (stryCov_9fa48("597"), () => setStep(stryMutAct_9fa48("598") ? "" : (stryCov_9fa48("598"), 'pin')))} className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            Enter PIN to Confirm
          </button>
        </div>)}

      {stryMutAct_9fa48("601") ? step === 'pin' || <PinPad title="Enter M-Wallet PIN" onComplete={pin => mutation.mutate(pin)} onCancel={() => setStep('confirm')} loading={mutation.isPending} /> : stryMutAct_9fa48("600") ? false : stryMutAct_9fa48("599") ? true : (stryCov_9fa48("599", "600", "601"), (stryMutAct_9fa48("603") ? step !== 'pin' : stryMutAct_9fa48("602") ? true : (stryCov_9fa48("602", "603"), step === (stryMutAct_9fa48("604") ? "" : (stryCov_9fa48("604"), 'pin')))) && <PinPad title="Enter M-Wallet PIN" onComplete={stryMutAct_9fa48("605") ? () => undefined : (stryCov_9fa48("605"), pin => mutation.mutate(pin))} onCancel={stryMutAct_9fa48("606") ? () => undefined : (stryCov_9fa48("606"), () => setStep(stryMutAct_9fa48("607") ? "" : (stryCov_9fa48("607"), 'confirm')))} loading={mutation.isPending} />)}
    </>;
    return <div className="px-6 pt-6 lg:px-0 lg:pt-4">
      {stryMutAct_9fa48("610") ? step !== 'success' || <button onClick={() => step === 'phone' ? navigate('/') : setStep(step === 'amount' ? 'phone' : step === 'confirm' ? 'amount' : 'phone')} className="flex items-center gap-2 text-gray-500 text-sm mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
          <ArrowLeft size={16} /> {step === 'phone' ? 'Home' : 'Back'}
        </button> : stryMutAct_9fa48("609") ? false : stryMutAct_9fa48("608") ? true : (stryCov_9fa48("608", "609", "610"), (stryMutAct_9fa48("612") ? step === 'success' : stryMutAct_9fa48("611") ? true : (stryCov_9fa48("611", "612"), step !== (stryMutAct_9fa48("613") ? "" : (stryCov_9fa48("613"), 'success')))) && <button onClick={stryMutAct_9fa48("614") ? () => undefined : (stryCov_9fa48("614"), () => (stryMutAct_9fa48("617") ? step !== 'phone' : stryMutAct_9fa48("616") ? false : stryMutAct_9fa48("615") ? true : (stryCov_9fa48("615", "616", "617"), step === (stryMutAct_9fa48("618") ? "" : (stryCov_9fa48("618"), 'phone')))) ? navigate(stryMutAct_9fa48("619") ? "" : (stryCov_9fa48("619"), '/')) : setStep((stryMutAct_9fa48("622") ? step !== 'amount' : stryMutAct_9fa48("621") ? false : stryMutAct_9fa48("620") ? true : (stryCov_9fa48("620", "621", "622"), step === (stryMutAct_9fa48("623") ? "" : (stryCov_9fa48("623"), 'amount')))) ? stryMutAct_9fa48("624") ? "" : (stryCov_9fa48("624"), 'phone') : (stryMutAct_9fa48("627") ? step !== 'confirm' : stryMutAct_9fa48("626") ? false : stryMutAct_9fa48("625") ? true : (stryCov_9fa48("625", "626", "627"), step === (stryMutAct_9fa48("628") ? "" : (stryCov_9fa48("628"), 'confirm')))) ? stryMutAct_9fa48("629") ? "" : (stryCov_9fa48("629"), 'amount') : stryMutAct_9fa48("630") ? "" : (stryCov_9fa48("630"), 'phone')))} className="flex items-center gap-2 text-gray-500 text-sm mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
          <ArrowLeft size={16} /> {(stryMutAct_9fa48("633") ? step !== 'phone' : stryMutAct_9fa48("632") ? false : stryMutAct_9fa48("631") ? true : (stryCov_9fa48("631", "632", "633"), step === (stryMutAct_9fa48("634") ? "" : (stryCov_9fa48("634"), 'phone')))) ? stryMutAct_9fa48("635") ? "" : (stryCov_9fa48("635"), 'Home') : stryMutAct_9fa48("636") ? "" : (stryCov_9fa48("636"), 'Back')}
        </button>)}

      <h2 className="text-xl font-bold text-gray-900 mb-6 lg:text-2xl">Send Money</h2>

      {(stryMutAct_9fa48("639") ? step !== 'success' : stryMutAct_9fa48("638") ? false : stryMutAct_9fa48("637") ? true : (stryCov_9fa48("637", "638", "639"), step === (stryMutAct_9fa48("640") ? "" : (stryCov_9fa48("640"), 'success')))) ? <div className="text-center pt-10 lg:pt-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful</h3>
          <p className="text-gray-500 mb-1">{formatKES(parseFloat(amount))} sent to {phone}</p>
          <p className="text-xs text-gray-400 font-mono">{reference}</p>
          <button onClick={stryMutAct_9fa48("641") ? () => undefined : (stryCov_9fa48("641"), () => navigate(stryMutAct_9fa48("642") ? "" : (stryCov_9fa48("642"), '/')))} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            Done
          </button>
        </div> : <div className="lg:grid lg:grid-cols-[minmax(0,30rem)_1fr] lg:gap-8 lg:items-start">
          <div className="lg:rounded-2xl lg:border lg:border-gray-100 lg:bg-white lg:p-8">
            {stepBody}
          </div>
          {stryMutAct_9fa48("645") ? isDesktop || <aside className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-900">Transfer summary</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Recipient</dt>
                  <dd className="font-medium text-gray-900">{phone || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Amount</dt>
                  <dd className="font-medium text-gray-900">{amount ? formatKES(amountNum) : '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Fee (1%)</dt>
                  <dd className="font-medium text-gray-900">{amount ? formatKES(liveFee) : '—'}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3">
                  <dt className="text-gray-500">Total</dt>
                  <dd className="font-bold text-gray-900">{amount ? formatKES(liveTotal) : '—'}</dd>
                </div>
                {remaining !== undefined && <div className="flex justify-between">
                    <dt className="text-gray-500">Remaining today</dt>
                    <dd className="font-medium text-gray-900">{formatKES(remaining)}</dd>
                  </div>}
              </dl>
            </aside> : stryMutAct_9fa48("644") ? false : stryMutAct_9fa48("643") ? true : (stryCov_9fa48("643", "644", "645"), isDesktop && <aside className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-900">Transfer summary</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Recipient</dt>
                  <dd className="font-medium text-gray-900">{stryMutAct_9fa48("648") ? phone && '—' : stryMutAct_9fa48("647") ? false : stryMutAct_9fa48("646") ? true : (stryCov_9fa48("646", "647", "648"), phone || (stryMutAct_9fa48("649") ? "" : (stryCov_9fa48("649"), '—')))}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Amount</dt>
                  <dd className="font-medium text-gray-900">{amount ? formatKES(amountNum) : stryMutAct_9fa48("650") ? "" : (stryCov_9fa48("650"), '—')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Fee (1%)</dt>
                  <dd className="font-medium text-gray-900">{amount ? formatKES(liveFee) : stryMutAct_9fa48("651") ? "" : (stryCov_9fa48("651"), '—')}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3">
                  <dt className="text-gray-500">Total</dt>
                  <dd className="font-bold text-gray-900">{amount ? formatKES(liveTotal) : stryMutAct_9fa48("652") ? "" : (stryCov_9fa48("652"), '—')}</dd>
                </div>
                {stryMutAct_9fa48("655") ? remaining !== undefined || <div className="flex justify-between">
                    <dt className="text-gray-500">Remaining today</dt>
                    <dd className="font-medium text-gray-900">{formatKES(remaining)}</dd>
                  </div> : stryMutAct_9fa48("654") ? false : stryMutAct_9fa48("653") ? true : (stryCov_9fa48("653", "654", "655"), (stryMutAct_9fa48("657") ? remaining === undefined : stryMutAct_9fa48("656") ? true : (stryCov_9fa48("656", "657"), remaining !== undefined)) && <div className="flex justify-between">
                    <dt className="text-gray-500">Remaining today</dt>
                    <dd className="font-medium text-gray-900">{formatKES(remaining)}</dd>
                  </div>)}
              </dl>
            </aside>)}
        </div>}
    </div>;
  }
}