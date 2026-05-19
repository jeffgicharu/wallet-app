// @ts-nocheck
// Single source of truth for money formatting. Every screen, receipt,
// history row, and disclosure renders amounts through these helpers so
// the currency symbol, decimal places, and thousands separators are
// identical everywhere: always "KES 1,234.50".
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
const nf = new Intl.NumberFormat(stryMutAct_9fa48("45") ? "" : (stryCov_9fa48("45"), 'en-KE'), stryMutAct_9fa48("46") ? {} : (stryCov_9fa48("46"), {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}));

/** "KES 1,234.50" — two decimals and grouped thousands, always. */
export function formatKES(n: number | null | undefined): string {
  if (stryMutAct_9fa48("47")) {
    {}
  } else {
    stryCov_9fa48("47");
    return stryMutAct_9fa48("48") ? `` : (stryCov_9fa48("48"), `KES ${nf.format(Number.isFinite(n as number) ? n as number : 0)}`);
  }
}

/** "+ KES 1,234.50" / "- KES 1,234.50" for sign-coded amounts. */
export function formatSignedKES(n: number | null | undefined, direction: 'in' | 'out'): string {
  if (stryMutAct_9fa48("49")) {
    {}
  } else {
    stryCov_9fa48("49");
    return stryMutAct_9fa48("50") ? `` : (stryCov_9fa48("50"), `${(stryMutAct_9fa48("53") ? direction !== 'out' : stryMutAct_9fa48("52") ? false : stryMutAct_9fa48("51") ? true : (stryCov_9fa48("51", "52", "53"), direction === (stryMutAct_9fa48("54") ? "" : (stryCov_9fa48("54"), 'out')))) ? stryMutAct_9fa48("55") ? "" : (stryCov_9fa48("55"), '-') : stryMutAct_9fa48("56") ? "" : (stryCov_9fa48("56"), '+')} ${formatKES(n)}`);
  }
}