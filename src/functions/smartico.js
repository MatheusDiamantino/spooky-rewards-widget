export function handleProtectedAction(deepLink, fallbackLoginUrl) {
    var login = fallbackLoginUrl || '/login'
    if (typeof _smartico !== 'undefined' && typeof _smartico.getPublicProps === 'function') {
        _smartico.getPublicProps(function (props) {
            var isLogged = props && props.player_id && props.player_id !== ''
            if (isLogged) {
                if (typeof _smartico.dp === 'function') {
                    _smartico.dp(deepLink)
                }
            } else {
                window.location.href = login
            }
        })
    } else {
        window.location.href = login
    }
}
