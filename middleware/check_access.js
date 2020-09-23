export default ({ $auth, $axios, redirect }) => {
  if ($auth.loggedIn) {
    if ($auth.$storage.getState('have_access') !== true) {
      return $axios.$get('/api/check_access').then((data) => {
        $auth.$storage.setState('have_access', data === true)
        if (data !== true) {
          redirect('/denied')
        }
      })
    }
  } else {
    redirect('/login')
  }
}
