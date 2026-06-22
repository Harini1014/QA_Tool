import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ValidatePage from './pages/ValidatePage'
import ReportPage   from './pages/ReportPage'

export default function App() {
  return (
    <Routes>
      <Route path="/"       element={<ValidatePage />} />
      <Route path="/report" element={<ReportPage />}   />
    </Routes>
  )
}
