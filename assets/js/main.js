// Countdown
(function(){
  const el = document.getElementById('countdown');
  if(!el) return;
  let target = new Date();
  target.setDate(target.getDate()+1);
  target.setHours(target.getHours()+21);
  target.setMinutes(target.getMinutes()+35);
  function tick(){
    const diff = target - new Date();
    if(diff<=0){ el.textContent='OFFRE EXPIRÉE'; return; }
    const h = Math.floor(diff/3.6e6);
    const m = Math.floor((diff%3.6e6)/6e4);
    const s = Math.floor((diff%6e4)/1e3);
    const hh=document.getElementById('hh'),mm=document.getElementById('mm'),ss=document.getElementById('ss');
    if(hh) hh.textContent = String(h).padStart(2,'0');
    if(mm) mm.textContent = String(m).padStart(2,'0');
    if(ss) ss.textContent = String(s).padStart(2,'0');
  }
  tick();
  setInterval(tick,1000);
})();

// Pricing toggle
function togglePrices(){
  const annual = document.getElementById('billing-switch').classList.contains('on');
  document.querySelectorAll('.plan .price .new, .plan .price .old').forEach(el=>{
    const m = el.dataset.month, a = el.dataset.annual;
    if(!m||!a) return;
    if(el.classList.contains('old')){
      el.style.display = annual ? '' : 'none';
    } else {
      el.textContent = '€' + (annual ? a : m);
    }
  });
}
// init: annual on by default
document.addEventListener('DOMContentLoaded',togglePrices);
