/* Auto-generated Android Native WebView Bridge */
(function () {
  if (typeof window === 'undefined') return;
  var bridge = window.AndroidNativeBridge;

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onloadend = function () {
        resolve(String(reader.result || ''));
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  
  // Intercept blob: and data:image downloads triggered via <a download>
  document.addEventListener('click', function (ev) {
    var anchor = ev.target && ev.target.closest ? ev.target.closest('a[download]') : null;
    if (!anchor || !bridge || typeof bridge.saveBase64File !== 'function') return;
    var href = anchor.getAttribute('href') || '';
    var filename = anchor.getAttribute('download') || ('export_' + Date.now() + '.png');
    if (href.startsWith('data:')) {
      ev.preventDefault();
      var mime = href.split(';')[0].replace('data:', '') || 'image/png';
      bridge.saveBase64File(href, filename, mime);
    } else if (href.startsWith('blob:')) {
      ev.preventDefault();
      fetch(href)
        .then(function (r) { return r.blob(); })
        .then(function (blob) {
          return blobToBase64(blob).then(function (dataUrl) {
            bridge.saveBase64File(dataUrl, filename, blob.type || 'application/octet-stream');
          });
        })
        .catch(function (err) { console.error('Android blob save failed', err); });
    }
  }, true);

  
  // Enhance navigator.share() to bridge directly to Android Intent.ACTION_SEND
  var originalShare = navigator.share ? navigator.share.bind(navigator) : null;
  navigator.share = async function (data) {
    if (bridge && typeof bridge.shareContent === 'function') {
      var title = (data && data.title) ? String(data.title) : document.title;
      var text = (data && (data.text || data.url))
        ? [data.text, data.url].filter(Boolean).join('\n')
        : '';
      var fileDataUrl = '';
      var mimeType = 'text/plain';
      if (data && data.files && data.files.length > 0) {
        var file = data.files[0];
        mimeType = file.type || 'image/png';
        fileDataUrl = await blobToBase64(file);
      }
      bridge.shareContent(title, text, fileDataUrl, mimeType);
      return;
    }
    if (originalShare) {
      return originalShare(data);
    }
    throw new Error('Share API unavailable');
  };
})();
