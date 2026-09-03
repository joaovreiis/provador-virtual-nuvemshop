(function () {
  'use strict';

  var currentScript = document.currentScript;
  var appUrl = currentScript && currentScript.dataset.appUrl;
  var configuredStoreId = currentScript && currentScript.dataset.storeId;
  var productId = (window.LS && window.LS.product && window.LS.product.id)
    || (window.product && window.product.id)
    || (currentScript && currentScript.dataset.productId);
  var storeId = configuredStoreId || (window.LS && window.LS.store && window.LS.store.id);

  if (!appUrl || !productId || !storeId || document.getElementById('provador-virtual-button')) return;

  var button = document.createElement('button');
  button.id = 'provador-virtual-button';
  button.type = 'button';
  button.textContent = 'Descobrir meu tamanho';
  button.style.cssText = 'display:block;width:100%;margin:16px 0;padding:13px 18px;border:0;border-radius:6px;background:#111;color:#fff;font:600 15px/1.2 sans-serif;cursor:pointer;';
  button.addEventListener('click', function () {
    var url = new URL(appUrl);
    url.searchParams.set('produto', String(productId));
    url.searchParams.set('loja', String(storeId));
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  });

  var target = document.querySelector('[data-product-form], form[action*="cart"], .product-form, .js-product-form');
  if (target && target.parentNode) target.parentNode.insertBefore(button, target.nextSibling);
})();
