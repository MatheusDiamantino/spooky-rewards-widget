
function updateAllCountdowns(text) {
    var spans = document.querySelectorAll('#countdown')
    for (var i = 0; i < spans.length; i++) spans[i].textContent = text
}

export function startCountdownToMidnight() {
    function getTimeToMidnight() {
        var now = new Date()
        var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        return midnight.getTime() - now.getTime()
    }
    function tick() {
        var distance = getTimeToMidnight()
        if (distance <= 0) { updateAllCountdowns('00:00:00'); return }
        var h = Math.floor(distance / 36e5), m = Math.floor(distance % 36e5 / 6e4), s = Math.floor(distance % 6e4 / 1e3)
        var fmt = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
        updateAllCountdowns(fmt)
    }
    tick()
    return setInterval(tick, 1000)
}
