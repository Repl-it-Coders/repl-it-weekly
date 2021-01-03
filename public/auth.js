(() => {
  var selem = document.currentScript;
  var button = document.createElement('button');
  button.className = "auth";
  button.textContent = 'Authenticate with repl.it';
  if (location.protocol !== 'https:') {
    var err = document.createElement('div');
    err.className = "auth-err";
    err.textContent = 'Repl.it auth requires SSL!\nPlease connect via the secure hyperttext transfer protocol to continue. (aka HTTPS)';
    selem.parentNode.insertBefore(err, selem);
  }     
  button.onclick = () => {    
    fetch('/api/login').then(res => res.text());
    window.addEventListener('message', authComplete);
    var h = 500;
    var w = 350;
    var left = (screen.width / 2) - ( w / 2);
    var top = (screen.height / 2) - (h / 2);
    console.log('https://repl.it/auth_with_repl_site?domain='+location.host);
    var authWindow = window.open(
      'https://repl.it/auth_with_repl_site?domain='
      +location.host,
      //+"reee.firefish.repl.co",
      '_blank',
      'modal =no, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left)
    function authComplete(e) {
      if (e.data !== 'auth_complete') return;
      window.removeEventListener('message', authComplete);
      authWindow.close();
      (selem.attributes.authed.value ? eval(selem.attributes.authed.value) : location.reload());
    }
    // var authWindow = window.open('https://repl.it/auth_with_repl_site?domain=' + location.host)    
  }
  selem.parentNode.append(button, selem);
})();
