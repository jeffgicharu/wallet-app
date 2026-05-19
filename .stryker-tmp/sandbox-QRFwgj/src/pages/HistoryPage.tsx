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
import { formatSignedKES } from '../lib/money';
import { direction, isFeeRow, transactionLabel } from '../lib/transactions';
import { useIsDesktop } from '../lib/useMediaQuery';
export function HistoryPage() {
  if (stryMutAct_9fa48("196")) {
    {}
  } else {
    stryCov_9fa48("196");
    const navigate = useNavigate();
    const {
      phone
    } = useAuth();
    const isDesktop = useIsDesktop();
    const {
      data,
      isLoading
    } = useQuery(stryMutAct_9fa48("197") ? {} : (stryCov_9fa48("197"), {
      queryKey: stryMutAct_9fa48("198") ? [] : (stryCov_9fa48("198"), [stryMutAct_9fa48("199") ? "" : (stryCov_9fa48("199"), 'transactions')]),
      queryFn: stryMutAct_9fa48("200") ? () => undefined : (stryCov_9fa48("200"), () => walletApi.getTransactions(0, 100).then(stryMutAct_9fa48("201") ? () => undefined : (stryCov_9fa48("201"), r => stryMutAct_9fa48("202") ? r.data.data.content : (stryCov_9fa48("202"), r.data.data.content.filter(stryMutAct_9fa48("203") ? () => undefined : (stryCov_9fa48("203"), t => stryMutAct_9fa48("204") ? isFeeRow(t) : (stryCov_9fa48("204"), !isFeeRow(t))))))))
    }));
    const fmtDate = stryMutAct_9fa48("205") ? () => undefined : (stryCov_9fa48("205"), (() => {
      const fmtDate = (d: string) => new Date(d).toLocaleDateString(stryMutAct_9fa48("206") ? "" : (stryCov_9fa48("206"), 'en-KE'), stryMutAct_9fa48("207") ? {} : (stryCov_9fa48("207"), {
        day: stryMutAct_9fa48("208") ? "" : (stryCov_9fa48("208"), 'numeric'),
        month: stryMutAct_9fa48("209") ? "" : (stryCov_9fa48("209"), 'short'),
        year: stryMutAct_9fa48("210") ? "" : (stryCov_9fa48("210"), 'numeric')
      }));
      return fmtDate;
    })());
    const rows = stryMutAct_9fa48("213") ? data && [] : stryMutAct_9fa48("212") ? false : stryMutAct_9fa48("211") ? true : (stryCov_9fa48("211", "212", "213"), data || (stryMutAct_9fa48("214") ? ["Stryker was here"] : (stryCov_9fa48("214"), [])));
    return <div className="px-6 pt-6 lg:px-0 lg:pt-4">
      <h2 className="text-xl font-bold text-gray-900 mb-6 lg:text-2xl">Transaction History</h2>

      {isLoading ? <div className="space-y-3">
          {(stryMutAct_9fa48("215") ? [] : (stryCov_9fa48("215"), [...(stryMutAct_9fa48("216") ? Array() : (stryCov_9fa48("216"), Array(8)))])).map(stryMutAct_9fa48("217") ? () => undefined : (stryCov_9fa48("217"), (_, i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />))}
        </div> : isDesktop ? (/* Desktop: a real table that uses the horizontal space. */
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(t => {
              if (stryMutAct_9fa48("218")) {
                {}
              } else {
                stryCov_9fa48("218");
                const dir = direction(t, phone);
                const color = (stryMutAct_9fa48("221") ? dir !== 'out' : stryMutAct_9fa48("220") ? false : stryMutAct_9fa48("219") ? true : (stryCov_9fa48("219", "220", "221"), dir === (stryMutAct_9fa48("222") ? "" : (stryCov_9fa48("222"), 'out')))) ? stryMutAct_9fa48("223") ? "" : (stryCov_9fa48("223"), 'text-red-600') : stryMutAct_9fa48("224") ? "" : (stryCov_9fa48("224"), 'text-green-600');
                const bg = (stryMutAct_9fa48("227") ? dir !== 'out' : stryMutAct_9fa48("226") ? false : stryMutAct_9fa48("225") ? true : (stryCov_9fa48("225", "226", "227"), dir === (stryMutAct_9fa48("228") ? "" : (stryCov_9fa48("228"), 'out')))) ? stryMutAct_9fa48("229") ? "" : (stryCov_9fa48("229"), 'bg-red-50') : stryMutAct_9fa48("230") ? "" : (stryCov_9fa48("230"), 'bg-green-50');
                return <tr key={t.reference} onClick={stryMutAct_9fa48("231") ? () => undefined : (stryCov_9fa48("231"), () => navigate(stryMutAct_9fa48("232") ? `` : (stryCov_9fa48("232"), `/history/${t.reference}`)))} tabIndex={0} onKeyDown={e => {
                  if (stryMutAct_9fa48("233")) {
                    {}
                  } else {
                    stryCov_9fa48("233");
                    if (stryMutAct_9fa48("236") ? e.key !== 'Enter' : stryMutAct_9fa48("235") ? false : stryMutAct_9fa48("234") ? true : (stryCov_9fa48("234", "235", "236"), e.key === (stryMutAct_9fa48("237") ? "" : (stryCov_9fa48("237"), 'Enter')))) navigate(stryMutAct_9fa48("238") ? `` : (stryCov_9fa48("238"), `/history/${t.reference}`));
                  }
                }} className="cursor-pointer transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-indigo-50">
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">{fmtDate(t.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={stryMutAct_9fa48("239") ? `` : (stryCov_9fa48("239"), `flex h-9 w-9 items-center justify-center rounded-full text-base font-bold ${color} ${bg}`)}>
                          {(stryMutAct_9fa48("242") ? dir !== 'out' : stryMutAct_9fa48("241") ? false : stryMutAct_9fa48("240") ? true : (stryCov_9fa48("240", "241", "242"), dir === (stryMutAct_9fa48("243") ? "" : (stryCov_9fa48("243"), 'out')))) ? stryMutAct_9fa48("244") ? "" : (stryCov_9fa48("244"), '-') : stryMutAct_9fa48("245") ? "" : (stryCov_9fa48("245"), '+')}
                        </span>
                        <span className="font-medium text-gray-900">{transactionLabel(t, phone)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{t.type}</td>
                    <td className="px-6 py-4">
                      <span className={(stryMutAct_9fa48("248") ? t.status !== 'COMPLETED' : stryMutAct_9fa48("247") ? false : stryMutAct_9fa48("246") ? true : (stryCov_9fa48("246", "247", "248"), t.status === (stryMutAct_9fa48("249") ? "" : (stryCov_9fa48("249"), 'COMPLETED')))) ? stryMutAct_9fa48("250") ? "" : (stryCov_9fa48("250"), 'text-gray-500') : (stryMutAct_9fa48("253") ? t.status !== 'PENDING' : stryMutAct_9fa48("252") ? false : stryMutAct_9fa48("251") ? true : (stryCov_9fa48("251", "252", "253"), t.status === (stryMutAct_9fa48("254") ? "" : (stryCov_9fa48("254"), 'PENDING')))) ? stryMutAct_9fa48("255") ? "" : (stryCov_9fa48("255"), 'text-amber-600') : stryMutAct_9fa48("256") ? "" : (stryCov_9fa48("256"), 'text-red-600')}>
                        {t.status}
                      </span>
                    </td>
                    <td className={stryMutAct_9fa48("257") ? `` : (stryCov_9fa48("257"), `whitespace-nowrap px-6 py-4 text-right font-semibold ${color}`)}>
                      {formatSignedKES(t.amount, dir)}
                    </td>
                  </tr>;
              }
            })}
            </tbody>
          </table>
          {stryMutAct_9fa48("260") ? rows.length === 0 || <p className="py-16 text-center text-sm text-gray-400">No transactions yet</p> : stryMutAct_9fa48("259") ? false : stryMutAct_9fa48("258") ? true : (stryCov_9fa48("258", "259", "260"), (stryMutAct_9fa48("262") ? rows.length !== 0 : stryMutAct_9fa48("261") ? true : (stryCov_9fa48("261", "262"), rows.length === 0)) && <p className="py-16 text-center text-sm text-gray-400">No transactions yet</p>)}
        </div>) : (/* Mobile: stacked card rows. */
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {rows.map(t => {
          if (stryMutAct_9fa48("263")) {
            {}
          } else {
            stryCov_9fa48("263");
            const dir = direction(t, phone);
            const color = (stryMutAct_9fa48("266") ? dir !== 'out' : stryMutAct_9fa48("265") ? false : stryMutAct_9fa48("264") ? true : (stryCov_9fa48("264", "265", "266"), dir === (stryMutAct_9fa48("267") ? "" : (stryCov_9fa48("267"), 'out')))) ? stryMutAct_9fa48("268") ? "" : (stryCov_9fa48("268"), 'text-red-500') : stryMutAct_9fa48("269") ? "" : (stryCov_9fa48("269"), 'text-green-500');
            const bg = (stryMutAct_9fa48("272") ? dir !== 'out' : stryMutAct_9fa48("271") ? false : stryMutAct_9fa48("270") ? true : (stryCov_9fa48("270", "271", "272"), dir === (stryMutAct_9fa48("273") ? "" : (stryCov_9fa48("273"), 'out')))) ? stryMutAct_9fa48("274") ? "" : (stryCov_9fa48("274"), 'bg-red-50') : stryMutAct_9fa48("275") ? "" : (stryCov_9fa48("275"), 'bg-green-50');
            return <button key={t.reference} onClick={stryMutAct_9fa48("276") ? () => undefined : (stryCov_9fa48("276"), () => navigate(stryMutAct_9fa48("277") ? `` : (stryCov_9fa48("277"), `/history/${t.reference}`)))} className="flex items-center gap-3 p-4 w-full text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                <div className={stryMutAct_9fa48("278") ? `` : (stryCov_9fa48("278"), `w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${color} ${bg}`)}>
                  {(stryMutAct_9fa48("281") ? dir !== 'out' : stryMutAct_9fa48("280") ? false : stryMutAct_9fa48("279") ? true : (stryCov_9fa48("279", "280", "281"), dir === (stryMutAct_9fa48("282") ? "" : (stryCov_9fa48("282"), 'out')))) ? stryMutAct_9fa48("283") ? "" : (stryCov_9fa48("283"), '-') : stryMutAct_9fa48("284") ? "" : (stryCov_9fa48("284"), '+')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{transactionLabel(t, phone)}</p>
                  <p className="text-xs text-gray-400">{fmtDate(t.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className={stryMutAct_9fa48("285") ? `` : (stryCov_9fa48("285"), `text-sm font-semibold ${color}`)}>{formatSignedKES(t.amount, dir)}</p>
                  {stryMutAct_9fa48("288") ? t.status !== 'COMPLETED' || <p className={`text-xs ${t.status === 'REVERSED' || t.status === 'FAILED' ? 'text-red-500' : 'text-gray-400'}`}>
                      {t.status}
                    </p> : stryMutAct_9fa48("287") ? false : stryMutAct_9fa48("286") ? true : (stryCov_9fa48("286", "287", "288"), (stryMutAct_9fa48("290") ? t.status === 'COMPLETED' : stryMutAct_9fa48("289") ? true : (stryCov_9fa48("289", "290"), t.status !== (stryMutAct_9fa48("291") ? "" : (stryCov_9fa48("291"), 'COMPLETED')))) && <p className={stryMutAct_9fa48("292") ? `` : (stryCov_9fa48("292"), `text-xs ${(stryMutAct_9fa48("295") ? t.status === 'REVERSED' && t.status === 'FAILED' : stryMutAct_9fa48("294") ? false : stryMutAct_9fa48("293") ? true : (stryCov_9fa48("293", "294", "295"), (stryMutAct_9fa48("297") ? t.status !== 'REVERSED' : stryMutAct_9fa48("296") ? false : (stryCov_9fa48("296", "297"), t.status === (stryMutAct_9fa48("298") ? "" : (stryCov_9fa48("298"), 'REVERSED')))) || (stryMutAct_9fa48("300") ? t.status !== 'FAILED' : stryMutAct_9fa48("299") ? false : (stryCov_9fa48("299", "300"), t.status === (stryMutAct_9fa48("301") ? "" : (stryCov_9fa48("301"), 'FAILED')))))) ? stryMutAct_9fa48("302") ? "" : (stryCov_9fa48("302"), 'text-red-500') : stryMutAct_9fa48("303") ? "" : (stryCov_9fa48("303"), 'text-gray-400')}`)}>
                      {t.status}
                    </p>)}
                </div>
              </button>;
          }
        })}
          {stryMutAct_9fa48("306") ? rows.length === 0 || <p className="text-center py-12 text-gray-400 text-sm">No transactions yet</p> : stryMutAct_9fa48("305") ? false : stryMutAct_9fa48("304") ? true : (stryCov_9fa48("304", "305", "306"), (stryMutAct_9fa48("308") ? rows.length !== 0 : stryMutAct_9fa48("307") ? true : (stryCov_9fa48("307", "308"), rows.length === 0)) && <p className="text-center py-12 text-gray-400 text-sm">No transactions yet</p>)}
        </div>)}
    </div>;
  }
}