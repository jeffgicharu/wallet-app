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
import type { Transaction } from '../types';
export type Direction = 'in' | 'out';

// The API returns a separate FEE transaction for the 1% transfer fee and
// also reports the fee on the TRANSFER row itself. Showing the standalone
// FEE row in the user-facing list would double-count the fee and (since
// it has no receiver) render mis-signed. Real mobile-money apps fold the
// fee into the transfer, which is exactly what the transfer detail does.
export function isFeeRow(t: Transaction): boolean {
  if (stryMutAct_9fa48("57")) {
    {}
  } else {
    stryCov_9fa48("57");
    return stryMutAct_9fa48("60") ? t.type !== 'FEE' : stryMutAct_9fa48("59") ? false : stryMutAct_9fa48("58") ? true : (stryCov_9fa48("58", "59", "60"), t.type === (stryMutAct_9fa48("61") ? "" : (stryCov_9fa48("61"), 'FEE')));
  }
}
export function isReversal(t: Transaction): boolean {
  if (stryMutAct_9fa48("62")) {
    {}
  } else {
    stryCov_9fa48("62");
    return stryMutAct_9fa48("63") ? t.reference.endsWith('REV-') : (stryCov_9fa48("63"), t.reference.startsWith(stryMutAct_9fa48("64") ? "" : (stryCov_9fa48("64"), 'REV-')));
  }
}

// Direction is decided purely by whether the signed-in wallet is the
// sender or the receiver of the transaction — not by type. A TRANSFER
// row carries BOTH senderPhone and receiverPhone, so a type-only rule
// (the old code) flagged every transfer as outgoing even when the user
// was the one receiving the money. Comparing against the user's own
// phone is correct for deposits, withdrawals, transfers, and reversals
// alike (a reversal swaps the sender/receiver wallets).
export function direction(t: Transaction, myPhone: string | null): Direction {
  if (stryMutAct_9fa48("65")) {
    {}
  } else {
    stryCov_9fa48("65");
    if (stryMutAct_9fa48("68") ? myPhone || t.senderPhone === myPhone : stryMutAct_9fa48("67") ? false : stryMutAct_9fa48("66") ? true : (stryCov_9fa48("66", "67", "68"), myPhone && (stryMutAct_9fa48("70") ? t.senderPhone !== myPhone : stryMutAct_9fa48("69") ? true : (stryCov_9fa48("69", "70"), t.senderPhone === myPhone)))) return stryMutAct_9fa48("71") ? "" : (stryCov_9fa48("71"), 'out');
    if (stryMutAct_9fa48("74") ? myPhone || t.receiverPhone === myPhone : stryMutAct_9fa48("73") ? false : stryMutAct_9fa48("72") ? true : (stryCov_9fa48("72", "73", "74"), myPhone && (stryMutAct_9fa48("76") ? t.receiverPhone !== myPhone : stryMutAct_9fa48("75") ? true : (stryCov_9fa48("75", "76"), t.receiverPhone === myPhone)))) return stryMutAct_9fa48("77") ? "" : (stryCov_9fa48("77"), 'in');
    // Fallbacks when the wallet phone isn't known yet.
    if (stryMutAct_9fa48("80") ? t.type !== 'DEPOSIT' : stryMutAct_9fa48("79") ? false : stryMutAct_9fa48("78") ? true : (stryCov_9fa48("78", "79", "80"), t.type === (stryMutAct_9fa48("81") ? "" : (stryCov_9fa48("81"), 'DEPOSIT')))) return stryMutAct_9fa48("82") ? "" : (stryCov_9fa48("82"), 'in');
    if (stryMutAct_9fa48("85") ? t.type === 'WITHDRAWAL' && t.type === 'FEE' : stryMutAct_9fa48("84") ? false : stryMutAct_9fa48("83") ? true : (stryCov_9fa48("83", "84", "85"), (stryMutAct_9fa48("87") ? t.type !== 'WITHDRAWAL' : stryMutAct_9fa48("86") ? false : (stryCov_9fa48("86", "87"), t.type === (stryMutAct_9fa48("88") ? "" : (stryCov_9fa48("88"), 'WITHDRAWAL')))) || (stryMutAct_9fa48("90") ? t.type !== 'FEE' : stryMutAct_9fa48("89") ? false : (stryCov_9fa48("89", "90"), t.type === (stryMutAct_9fa48("91") ? "" : (stryCov_9fa48("91"), 'FEE')))))) return stryMutAct_9fa48("92") ? "" : (stryCov_9fa48("92"), 'out');
    return t.senderPhone ? stryMutAct_9fa48("93") ? "" : (stryCov_9fa48("93"), 'out') : stryMutAct_9fa48("94") ? "" : (stryCov_9fa48("94"), 'in');
  }
}

// A human label for the row. Transfers read naturally for BOTH parties
// ("Sent to …" / "Received from …") instead of echoing the sender-side
// description back to the receiver.
export function transactionLabel(t: Transaction, myPhone: string | null): string {
  if (stryMutAct_9fa48("95")) {
    {}
  } else {
    stryCov_9fa48("95");
    if (stryMutAct_9fa48("97") ? false : stryMutAct_9fa48("96") ? true : (stryCov_9fa48("96", "97"), isReversal(t))) return stryMutAct_9fa48("98") ? "" : (stryCov_9fa48("98"), 'Reversal');
    switch (t.type) {
      case stryMutAct_9fa48("100") ? "" : (stryCov_9fa48("100"), 'DEPOSIT'):
        if (stryMutAct_9fa48("99")) {} else {
          stryCov_9fa48("99");
          return stryMutAct_9fa48("103") ? t.description && 'Cash deposit' : stryMutAct_9fa48("102") ? false : stryMutAct_9fa48("101") ? true : (stryCov_9fa48("101", "102", "103"), t.description || (stryMutAct_9fa48("104") ? "" : (stryCov_9fa48("104"), 'Cash deposit')));
        }
      case stryMutAct_9fa48("106") ? "" : (stryCov_9fa48("106"), 'WITHDRAWAL'):
        if (stryMutAct_9fa48("105")) {} else {
          stryCov_9fa48("105");
          return stryMutAct_9fa48("109") ? t.description && 'Cash withdrawal' : stryMutAct_9fa48("108") ? false : stryMutAct_9fa48("107") ? true : (stryCov_9fa48("107", "108", "109"), t.description || (stryMutAct_9fa48("110") ? "" : (stryCov_9fa48("110"), 'Cash withdrawal')));
        }
      case stryMutAct_9fa48("112") ? "" : (stryCov_9fa48("112"), 'FEE'):
        if (stryMutAct_9fa48("111")) {} else {
          stryCov_9fa48("111");
          return stryMutAct_9fa48("115") ? t.description && 'Transfer fee' : stryMutAct_9fa48("114") ? false : stryMutAct_9fa48("113") ? true : (stryCov_9fa48("113", "114", "115"), t.description || (stryMutAct_9fa48("116") ? "" : (stryCov_9fa48("116"), 'Transfer fee')));
        }
      case stryMutAct_9fa48("118") ? "" : (stryCov_9fa48("118"), 'TRANSFER'):
        if (stryMutAct_9fa48("117")) {} else {
          stryCov_9fa48("117");
          return (stryMutAct_9fa48("121") ? direction(t, myPhone) !== 'out' : stryMutAct_9fa48("120") ? false : stryMutAct_9fa48("119") ? true : (stryCov_9fa48("119", "120", "121"), direction(t, myPhone) === (stryMutAct_9fa48("122") ? "" : (stryCov_9fa48("122"), 'out')))) ? t.receiverPhone ? stryMutAct_9fa48("123") ? `` : (stryCov_9fa48("123"), `Sent to ${t.receiverPhone}`) : stryMutAct_9fa48("126") ? t.description && 'Money sent' : stryMutAct_9fa48("125") ? false : stryMutAct_9fa48("124") ? true : (stryCov_9fa48("124", "125", "126"), t.description || (stryMutAct_9fa48("127") ? "" : (stryCov_9fa48("127"), 'Money sent'))) : t.senderPhone ? stryMutAct_9fa48("128") ? `` : (stryCov_9fa48("128"), `Received from ${t.senderPhone}`) : stryMutAct_9fa48("131") ? t.description && 'Money received' : stryMutAct_9fa48("130") ? false : stryMutAct_9fa48("129") ? true : (stryCov_9fa48("129", "130", "131"), t.description || (stryMutAct_9fa48("132") ? "" : (stryCov_9fa48("132"), 'Money received')));
        }
      default:
        if (stryMutAct_9fa48("133")) {} else {
          stryCov_9fa48("133");
          return stryMutAct_9fa48("136") ? t.description && t.type : stryMutAct_9fa48("135") ? false : stryMutAct_9fa48("134") ? true : (stryCov_9fa48("134", "135", "136"), t.description || t.type);
        }
    }
  }
}