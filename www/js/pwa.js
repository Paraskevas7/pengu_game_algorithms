/* Makes the hosted site installable and usable offline (a service worker made by tools/build.py).
   It does nothing in the phone apps, on file:// pages or on plain http. */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator) || window.Capacitor) return;
  var h = location.hostname;
  if (location.protocol !== 'https:' && h !== 'localhost' && h !== '127.0.0.1') return;
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
})();
