// Redirect ke cover bila belum "dibuka"
(function(){
  try{
    const qp = new URLSearchParams(location.search);
    if (qp.get('opened') !== '1') {
      location.replace('cover.html' + (location.search || ''));
    }
  }catch(e){}
})();
