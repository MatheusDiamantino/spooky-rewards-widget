export function isAllowed() {
    var href = (window.location && window.location.href || '').toLowerCase()
    var disallowed = href.indexOf('/game') !== -1 || href.indexOf('/live-casino') !== -1
    var allowedDomain = (
        href.indexOf('casa.example.com/casino') !== -1 ||
        href.indexOf('casa.example.com/casino') !== -1 ||
        href.indexOf('http://localhost:5173/') !== -1
    )
    return allowedDomain && !disallowed
}
