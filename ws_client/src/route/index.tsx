
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Loading from 'components/Loading'
// import AuthRoute from './AuthRoute'

const Connect = lazy(() => import('pages/Connect'))
const Setting = lazy(() => import('pages/Setting'))
const Page404 = lazy(() => import('pages/404'))

const Routes = () => {

  return useRoutes([
    {
      path: '/', element: <Connect />
    },
    {
      // path: '/setting', element: <AuthRoute components={<Setting />} redirect='/' />
      path: '/setting', element: <Setting />
    },
    {
      path: '*', element: <Page404 />
    },
  ])
}

const AppRoutes = () => {

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes />
      </Suspense>
    </BrowserRouter>

  )
}
export default AppRoutes