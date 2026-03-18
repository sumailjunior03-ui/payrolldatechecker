// footer.js (shared framework stub)
// Purpose: keep footer rendering consistent across the Calc-HQ utility network.
// network.js is the single source of truth for Related Tools rendering.
(function () {
  if (typeof window.renderRelatedTools !== "function") return;
  document.addEventListener("DOMContentLoaded", function () {
    // Footer related tools (global)
    if (document.getElementById("related-tools")) {
      window.renderRelatedTools("related-tools");
    }
    // Tool-page related calculators (optional)
    if (document.getElementById("related-calculators")) {
      window.renderRelatedTools("related-calculators");
    }
  });
})();
