/* GA4 - Calc-HQ Network Analytics (single injection point) */
(function(){if(!window.__GA4_LOADED){window.__GA4_LOADED=true;var id="G-W4SWZ1YRS2";var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+id;document.head.appendChild(s);window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag("js",new Date());gtag("config",id);}})();

/* CalcHQ Network — v6 root network.js
   CALCHQ_NETWORK array + renderRelatedTools for footer.js */

window.CALCHQ_NETWORK = [
  { name: "Calc-HQ",                     url: "https://calc-hq.com" },
  { name: "BizDayChecker.com",           url: "https://bizdaychecker.com" },
  { name: "BankCutoffChecker.com",       url: "https://bankcutoffchecker.com" },
  { name: "SalaryVsInflation.com",       url: "https://salaryvsinflation.com" },
  { name: "Hourly2SalaryCalc.com",       url: "https://hourly2salarycalc.com" },
  { name: "PayrollDateChecker.com",      url: "https://payrolldatechecker.com" },
  { name: "1099vsW2Calc.com",            url: "https://1099vsw2calc.com" },
  { name: "FreelanceIncomeCalc.com",     url: "https://freelanceincomecalc.com" },
  { name: "QuarterlyTaxCalc.com",        url: "https://quarterlytaxcalc.com" },
  { name: "TotalCompCalc.com",           url: "https://totalcompcalc.com" },
  { name: "OvertimePayCalc.com",         url: "https://overtimepaycalc.com" },
  { name: "AfterTaxSalaryCalc.com",      url: "https://aftertaxsalarycalc.com" }
];

(function () {
  var FORBIDDEN = [];

  function loadForbidden(cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/forbidden-domains.json", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var parsed = JSON.parse(xhr.responseText);
            if (Array.isArray(parsed)) {
              FORBIDDEN = parsed.map(function (d) { return d.toLowerCase().replace(/^www\./, ""); });
            }
          } catch (e) { /* proceed */ }
        }
        cb();
      }
    };
    xhr.onerror = function () { cb(); };
    xhr.send();
  }

  function normalizeHost(str) {
    try { return new URL(str).hostname.replace(/^www\./, "").toLowerCase(); }
    catch (e) { return String(str).toLowerCase().replace(/^www\./, ""); }
  }

  window.renderRelatedTools = function (containerId) {
    var container = document.getElementById(containerId);
    if (!container || !window.CALCHQ_NETWORK) return;

    var currentHost = window.location.hostname.replace(/^www\./, "").toLowerCase();

    var links = window.CALCHQ_NETWORK.filter(function (site) {
      if (!site) return false;
      var host = normalizeHost(site.url);
      if (host === currentHost) return false;
      if (host === "calc-hq.com") return false;
      if (FORBIDDEN.indexOf(host) !== -1) return false;
      return true;
    });

    container.innerHTML = "";
    links.forEach(function (site) {
      var a = document.createElement("a");
      a.href = site.url;
      a.textContent = site.name;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      container.appendChild(a);
    });
  };

  loadForbidden(function () { /* renderRelatedTools called by footer.js on DOMContentLoaded */ });
})();
