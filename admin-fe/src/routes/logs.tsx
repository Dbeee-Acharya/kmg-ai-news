import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLogsQuery } from '../query/useLogsQuery'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Loader2, ShieldAlert, History, User, Activity } from 'lucide-react'
import { format } from 'date-fns'

export const Route = createFileRoute('/logs')({
  component: LogsComponent,
})

function LogsComponent() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const { data: logs, isLoading, isError } = useLogsQuery()

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate({ to: '/login' })
    }
    if (!isAuthLoading && isAuthenticated && !user?.isSuperAdmin) {
      navigate({ to: '/' })
    }
  }, [isAuthenticated, isAuthLoading, navigate, user])

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user?.isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-500 max-w-md mx-auto mt-2">
          Only super-administrators have permission to view activity logs.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <History className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Activity Logs</h1>
            <p className="text-gray-500">Audit trail for all news operations</p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-gray-50/50 border-b pb-6">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-500" />
            System Audit Trail
          </CardTitle>
          <CardDescription>Chronological list of all admin actions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="w-[180px] font-semibold py-4 px-6">Timestamp</TableHead>
                  <TableHead className="w-[180px] font-semibold py-4">Action</TableHead>
                  <TableHead className="w-[200px] font-semibold py-4">User</TableHead>
                  <TableHead className="font-semibold py-4">Entity</TableHead>
                  <TableHead className="w-[150px] font-semibold py-4 px-6 text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs && logs.length > 0 ? (
                  logs.map((log: any) => (
                    <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">
                        {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                      </TableCell>
                      <TableCell className="py-4 leading-none">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                          log.action.includes('create') ? 'bg-blue-100 text-blue-700' :
                          log.action.includes('update') ? 'bg-orange-100 text-orange-700' :
                          log.action.includes('delete') ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {log.userName || 'System (Superadmin)'}
                            </span>
                            <span className="text-xs text-gray-400 truncate">{log.userEmail || 'Internal'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">
                            {log.metadata?.title || log.entityId || 'N/A'}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 uppercase">
                            {log.entityType || 'Action'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right font-mono text-[10px] text-gray-400">
                        {log.ip || 'Local'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-400">
                      {isError ? 'Failed to load logs' : 'No activity logs recorded'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
