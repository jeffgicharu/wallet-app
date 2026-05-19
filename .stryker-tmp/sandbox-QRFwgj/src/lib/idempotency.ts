// @ts-nocheck
// Idempotency keys for money-moving requests.
//
// The wallet-api derives a transaction reference as `{PREFIX}-{key}`
// (TRF-, DEP-, WDR-). The key must therefore NOT carry its own prefix —
// passing "TRF-..." produced a doubled "TRF-TRF-..." reference on the
// success screen. It must also be stable across retries of the *same*
// intent so a lost-response retry replays the original transaction
// instead of charging twice; callers generate one key per confirmed
// intent and reuse it for every attempt.
//
// 8 uppercase hex chars matches the seed's reference style
// (e.g. TRF-9F4A2B1C) so demo and live transactions look identical.
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
export function newIdempotencyKey(): string {
  if (stryMutAct_9fa48("40")) {
    {}
  } else {
    stryCov_9fa48("40");
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return stryMutAct_9fa48("41") ? Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toLowerCase() : (stryCov_9fa48("41"), Array.from(bytes, stryMutAct_9fa48("42") ? () => undefined : (stryCov_9fa48("42"), b => b.toString(16).padStart(2, stryMutAct_9fa48("43") ? "" : (stryCov_9fa48("43"), '0')))).join(stryMutAct_9fa48("44") ? "Stryker was here!" : (stryCov_9fa48("44"), '')).toUpperCase());
  }
}