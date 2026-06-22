import React, { useMemo, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

function BadgeCell({ value, color }) {
  const colors = {
    purple: 'bg-purple-100 text-purple-800',
    blue  : 'bg-blue-100 text-blue-800',
    red   : 'bg-red-100 text-red-800',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${colors[color] || colors.purple}`}>
      {value}
    </span>
  )
}

function CheckBadge(p)    { return <BadgeCell value={p.value} color="purple" /> }
function PageBadge(p)     { return <BadgeCell value={p.value} color="blue"   /> }

export default function ReportPage() {
  const location = useLocation()
  const navigate  = useNavigate()
  const result  = location.state?.result
  const checks  = location.state?.checks || []

  if (!result) {
    navigate('/')
    return null
  }

  const { errors, total_errors, total_pages, affected_pages, checks_run } = result

  const rowData = useMemo(() =>
    errors.map((e, i) => ({ no: i + 1, check: e.check, page: e.page || '—', location: e.location })),
    [errors]
  )

  const colDefs = useMemo(() => [
    { field: 'no',       headerName: '#',               width: 60,  sortable: true },
    { field: 'check',    headerName: 'Check Item',       flex: 1.2,  sortable: true, filter: true, cellRenderer: CheckBadge },
    { field: 'page',     headerName: 'Page',             width: 90,  sortable: true, cellRenderer: PageBadge },
    { field: 'location', headerName: 'Location Reference', flex: 2,  sortable: true, filter: true,
      wrapText: true, autoHeight: true,
      cellStyle: { lineHeight: '1.5', paddingTop: '8px', paddingBottom: '8px' } },
  ], [])

  const defaultColDef = useMemo(() => ({
    resizable : true,
    suppressMovable: false,
  }), [])

  function exportCSV() {
    const header = ['#', 'Check Item', 'Page', 'Location Reference']
    const rows = errors.map((e, i) => [i + 1, e.check, e.page || '—', e.location])
    const csv  = [header, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'qc-report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  function exportTXT() {
    const lines = [
      'PUBLISHING QA VALIDATION REPORT',
      '='.repeat(60),
      '',
      `Total Errors   : ${total_errors}`,
      `Checks Run     : ${checks_run}`,
      `Total Pages    : ${total_pages}`,
      `Affected Pages : ${affected_pages.join(', ') || 'N/A'}`,
      '',
      '-'.repeat(60),
      `${'#'.padEnd(4)} ${'Check Item'.padEnd(36)} ${'Page'.padEnd(8)} Location`,
      '-'.repeat(60),
      ...errors.map((e, i) =>
        `${String(i+1).padEnd(4)} ${(e.check||'').padEnd(36)} ${(e.page||'—').padEnd(8)} ${e.location||'—'}`
      ),
    ]
    const blob = new Blob([lines.join('\r\n')], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'qc-report.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Validation Report</h1>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Errors',    value: total_errors,              color: total_errors > 0 ? 'text-red-600' : 'text-green-600' },
            { label: 'Checks Run',      value: checks_run,                color: 'text-gray-900' },
            { label: 'Total Pages',     value: total_pages,               color: 'text-gray-900' },
            { label: 'Affected Pages',  value: affected_pages.length,     color: affected_pages.length > 0 ? 'text-orange-600' : 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Affected pages */}
        {affected_pages.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4 text-sm text-orange-700">
            <strong>Affected pages:</strong> {affected_pages.join(', ')}
          </div>
        )}

        {/* No errors */}
        {total_errors === 0 && (
          <div className="bg-white border border-green-200 rounded-xl p-10 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-lg font-semibold text-green-700">No errors found</p>
            <p className="text-sm text-gray-500 mt-1">All {checks_run} checks passed successfully.</p>
          </div>
        )}

        {/* AG Grid table */}
        {total_errors > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">
                {total_errors} error{total_errors !== 1 ? 's' : ''} found
              </p>
              <div className="flex gap-2">
                <button onClick={exportCSV}
                  className="text-xs border border-gray-200 bg-white text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-1">
                  ⬇ CSV
                </button>
                <button onClick={exportTXT}
                  className="text-xs border border-gray-200 bg-white text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-1">
                  ⬇ TXT
                </button>
              </div>
            </div>
            <div className="ag-theme-alpine w-full" style={{ height: Math.min(80 + rowData.length * 52, 600) }}>
              <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
                rowSelection="single"
                suppressCellFocus={true}
                pagination={rowData.length > 50}
                paginationPageSize={50}
              />
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4 text-center">
          Publishing QA Validation Tool — powered by PyMuPDF + python-docx
        </p>
      </div>
    </div>
  )
}
