// Inicialização do GA4 sem script inline (CSP). Só é carregado se PUBLIC_GA_ID estiver definido.
// Consentimento negado por padrão: sem cookies de analytics até haver aviso/aceite.
(function () {
  var id = document.currentScript && document.currentScript.dataset.gaId;
  if (!id) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  window.gtag('config', id, { allow_google_signals: false });
})();
