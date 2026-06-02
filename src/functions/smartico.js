export function handleProtectedAction(deepLink, fallbackLoginUrl) {
    var login = fallbackLoginUrl || '/login'
    var s = window && window._smartico
    if (s && typeof s.getPublicProps === 'function') {
        s.getPublicProps(function (props) {
            var isLogged = props && props.player_id && props.player_id !== ''
            if (isLogged) {
                if (typeof s.dp === 'function') {
                    s.dp(deepLink)
                }
            } else {
                window.location.href = login
            }
        })
    } else {
        window.location.href = login
    }
}
