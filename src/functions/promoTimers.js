export function runPromoTimers({ selectorCard = '.promo-card', selectorTimer = '.promo-timer', schedule = [] }) {
    const cards = document.querySelectorAll(selectorCard)
    const timers = document.querySelectorAll(selectorTimer)
    const overlays = []
    for (let idx = 0; idx < cards.length; idx++) overlays.push(cards[idx].querySelector('.promo-overlay-dyn'))

    // Complete datas a partir do schedule (mesma ordem dos cards)
    const startDates = [], endDates = []
    for (let idx = 0; idx < timers.length; idx++) {
        if (schedule[idx]) { startDates.push(schedule[idx].start); endDates.push(schedule[idx].end) }
        else {
            // fallback (meio-dia até 00:00)
            const today = new Date(); today.setHours(0, 0, 0, 0)
            startDates.push(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0))
            endDates.push(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0))
        }
    }

    function checkParticipation(promoId, cb) {
        var local = localStorage.getItem(promoId + '_participated') === '1'
        cb(local)
    }

    function startCountdown(el, endTime) {
        function upd() {
            var now = new Date(), dist = endTime - now
            if (dist <= 0) { el.textContent = '00:00:00'; return }
            var h = Math.floor(dist / 36e5), m = Math.floor(dist % 36e5 / 6e4), s = Math.floor(dist % 6e4 / 1e3)
            el.textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
        }
        upd(); return setInterval(upd, 1000)
    }

    const countdownIntervals = [], prev = []
    function setState(i, state) {
        const el = timers[i], card = cards[i], overlay = overlays[i], promoId = card.getAttribute('data-smartico')
        checkParticipation(promoId, function (participated) {
            if (state === 'active') {
                card.disabled = false; card.style.pointerEvents = ''; card.style.display = 'flex'
                if (overlay) { overlay.style.display = 'none'; overlay.innerHTML = '' }
            } else if (state === 'future') {
                card.disabled = true; card.style.pointerEvents = 'none'; card.style.display = 'flex'
                el.textContent = 'Em breve'
                if (overlay) { overlay.className = 'promo-overlay-dyn promo-overlay-future'; overlay.innerHTML = '<span class="promo-overlay-icon">🔒</span><span>Em breve</span>'; overlay.style.display = 'flex' }
            } else { // ended
                card.disabled = true; card.style.pointerEvents = 'none'
                if (participated) {
                    card.style.display = 'flex'; el.textContent = '00:00:00'
                    if (overlay) { overlay.className = 'promo-overlay-dyn promo-overlay-ended'; overlay.innerHTML = '<span class="promo-overlay-icon">⏰</span><span>Promoção Encerrada</span>'; overlay.style.display = 'flex' }
                } else {
                    card.style.display = 'none'
                }
            }
        })
    }

    function loop() {
        const now = new Date()
        for (let idx = 0; idx < startDates.length; idx++) {
            const st = startDates[idx], en = endDates[idx]
            let stt = ''
            if (now >= st && now <= en) stt = 'active'
            else if (now > en) stt = 'ended'
            else stt = 'future'
            if (prev[idx] !== stt) {
                prev[idx] = stt; setState(idx, stt)
                if (stt === 'active' && !countdownIntervals[idx]) countdownIntervals[idx] = startCountdown(timers[idx], en)
                if (stt === 'ended') clearInterval(countdownIntervals[idx])
            }
        }
    }

    loop()
    return setInterval(loop, 1000)
}
