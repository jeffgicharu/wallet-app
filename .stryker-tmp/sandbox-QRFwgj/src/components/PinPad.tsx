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
import { Delete } from 'lucide-react';
interface PinPadProps {
  title: string;
  onComplete: (pin: string) => void;
  onCancel: () => void;
  loading?: boolean;
}
export function PinPad({
  title,
  onComplete,
  onCancel,
  loading
}: PinPadProps) {
  if (stryMutAct_9fa48("0")) {
    {}
  } else {
    stryCov_9fa48("0");
    const [pin, setPin] = useState(stryMutAct_9fa48("1") ? "Stryker was here!" : (stryCov_9fa48("1"), ''));
    const handlePress = (digit: string) => {
      if (stryMutAct_9fa48("2")) {
        {}
      } else {
        stryCov_9fa48("2");
        if (stryMutAct_9fa48("6") ? pin.length >= 4 : stryMutAct_9fa48("5") ? pin.length <= 4 : stryMutAct_9fa48("4") ? false : stryMutAct_9fa48("3") ? true : (stryCov_9fa48("3", "4", "5", "6"), pin.length < 4)) {
          if (stryMutAct_9fa48("7")) {
            {}
          } else {
            stryCov_9fa48("7");
            const next = stryMutAct_9fa48("8") ? pin - digit : (stryCov_9fa48("8"), pin + digit);
            setPin(next);
            if (stryMutAct_9fa48("11") ? next.length !== 4 : stryMutAct_9fa48("10") ? false : stryMutAct_9fa48("9") ? true : (stryCov_9fa48("9", "10", "11"), next.length === 4)) {
              if (stryMutAct_9fa48("12")) {
                {}
              } else {
                stryCov_9fa48("12");
                onComplete(next);
              }
            }
          }
        }
      }
    };
    const handleDelete = stryMutAct_9fa48("13") ? () => undefined : (stryCov_9fa48("13"), (() => {
      const handleDelete = () => setPin(stryMutAct_9fa48("14") ? () => undefined : (stryCov_9fa48("14"), p => stryMutAct_9fa48("15") ? p : (stryCov_9fa48("15"), p.slice(0, stryMutAct_9fa48("16") ? +1 : (stryCov_9fa48("16"), -1)))));
      return handleDelete;
    })());
    return <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8">
        <p className="text-center text-lg font-semibold text-gray-900 mb-2">{title}</p>

        <div className="flex justify-center gap-4 my-6">
          {(stryMutAct_9fa48("17") ? [] : (stryCov_9fa48("17"), [0, 1, 2, 3])).map(stryMutAct_9fa48("18") ? () => undefined : (stryCov_9fa48("18"), i => <div key={i} className={stryMutAct_9fa48("19") ? `` : (stryCov_9fa48("19"), `w-4 h-4 rounded-full transition-colors ${(stryMutAct_9fa48("23") ? i >= pin.length : stryMutAct_9fa48("22") ? i <= pin.length : stryMutAct_9fa48("21") ? false : stryMutAct_9fa48("20") ? true : (stryCov_9fa48("20", "21", "22", "23"), i < pin.length)) ? stryMutAct_9fa48("24") ? "" : (stryCov_9fa48("24"), 'bg-indigo-600') : stryMutAct_9fa48("25") ? "" : (stryCov_9fa48("25"), 'bg-gray-200')}`)} />))}
        </div>

        {loading ? <p className="text-center text-gray-500 py-8">Processing...</p> : <div className="grid grid-cols-3 gap-3">
            {(stryMutAct_9fa48("26") ? [] : (stryCov_9fa48("26"), [stryMutAct_9fa48("27") ? "" : (stryCov_9fa48("27"), '1'), stryMutAct_9fa48("28") ? "" : (stryCov_9fa48("28"), '2'), stryMutAct_9fa48("29") ? "" : (stryCov_9fa48("29"), '3'), stryMutAct_9fa48("30") ? "" : (stryCov_9fa48("30"), '4'), stryMutAct_9fa48("31") ? "" : (stryCov_9fa48("31"), '5'), stryMutAct_9fa48("32") ? "" : (stryCov_9fa48("32"), '6'), stryMutAct_9fa48("33") ? "" : (stryCov_9fa48("33"), '7'), stryMutAct_9fa48("34") ? "" : (stryCov_9fa48("34"), '8'), stryMutAct_9fa48("35") ? "" : (stryCov_9fa48("35"), '9')])).map(stryMutAct_9fa48("36") ? () => undefined : (stryCov_9fa48("36"), d => <button key={d} onClick={stryMutAct_9fa48("37") ? () => undefined : (stryCov_9fa48("37"), () => handlePress(d))} className="h-14 rounded-xl bg-gray-50 text-xl font-semibold text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors">
                {d}
              </button>))}
            <button onClick={onCancel} className="h-14 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50">Cancel</button>
            <button onClick={stryMutAct_9fa48("38") ? () => undefined : (stryCov_9fa48("38"), () => handlePress(stryMutAct_9fa48("39") ? "" : (stryCov_9fa48("39"), '0')))} className="h-14 rounded-xl bg-gray-50 text-xl font-semibold text-gray-900 hover:bg-gray-100 active:bg-gray-200">0</button>
            <button onClick={handleDelete} className="h-14 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <Delete size={22} />
            </button>
          </div>}
      </div>
    </div>;
  }
}