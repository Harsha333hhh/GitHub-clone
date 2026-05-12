import React from 'react'
import { Outlet } from 'react-router-dom'

function PublicLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-canvas)',
    }}>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
