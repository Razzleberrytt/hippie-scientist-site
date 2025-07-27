import { lazy } from 'react'
import { RouteObject } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Learn = lazy(() => import('./pages/Learn'))
const Lesson = lazy(() => import('./pages/Lesson'))
const Database = lazy(() => import('./pages/Database'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Research = lazy(() => import('./pages/Research'))
const HerbCardPage = lazy(() => import('./pages/HerbCardPage'))
const HerbDetailView = lazy(() => import('./pages/HerbDetailView'))
const Compounds = lazy(() => import('./pages/Compounds'))
const Store = lazy(() => import('./pages/Store'))
const Downloads = lazy(() => import('./pages/Downloads'))
const HerbBlender = lazy(() => import('./pages/HerbBlender'))
const NotFound = lazy(() => import('./pages/NotFound'))
const HerbDetailPage = lazy(() => import('./pages/HerbDetailPage'))

export const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/learn', element: <Learn /> },
  { path: '/learn/:slug', element: <Lesson /> },
  { path: '/database', element: <Database /> },
  { path: '/favorites', element: <Favorites /> },
  { path: '/research', element: <Research /> },
  { path: '/herbs/:herbId', element: <HerbCardPage /> },
  { path: '/herb/:id', element: <HerbDetailView /> },
  { path: '/compounds', element: <Compounds /> },
  { path: '/store', element: <Store /> },
  { path: '/downloads', element: <Downloads /> },
  { path: '/blend', element: <HerbBlender /> },
  { path: '/herbdetail/:herbId', element: <HerbDetailPage /> },
  { path: '*', element: <NotFound /> },
]
