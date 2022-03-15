import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Loading from 'components/Loading'

const Connect = lazy(() => import('pages/Connect'))
const Setting = lazy(() => import('pages/Setting'))
const Page404 = lazy(() => import('pages/404'))

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path='/' element={<Connect />} />
          <Route path='/setting' element={<Setting />} />
          <Route path='*' element={<Page404 />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
export default AppRoutes