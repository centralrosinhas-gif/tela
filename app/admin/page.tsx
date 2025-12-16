'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

interface Route {
  id: string
  slug: string
  name: string
  botToken: string
  chatId: string
}

interface Request {
  id: string
  routeId: string
  data: any
  status: string
  error?: string
  createdAt: string
  route: Route
}

export default function AdminPanel() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false)
  const [newRoute, setNewRoute] = useState({
    slug: '',
    name: '',
    botToken: '',
    chatId: ''
  })

  useEffect(() => {
    fetchRoutes()
    fetchRequests()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/routes')
      const data = await response.json()
      setRoutes(data)
    } catch (error) {
      toast.error('Failed to fetch routes')
    }
  }

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests')
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      toast.error('Failed to fetch requests')
    }
  }

  const handleAddRoute = async () => {
    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoute)
      })

      if (!response.ok) throw new Error('Failed to add route')

      toast.success('Route added successfully')
      setIsAddRouteOpen(false)
      setNewRoute({ slug: '', name: '', botToken: '', chatId: '' })
      fetchRoutes()
    } catch (error) {
      toast.error('Failed to add route')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
          <DialogTrigger asChild>
            <Button>Add New Route</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Route</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="slug">Route Slug</Label>
                <Input
                  id="slug"
                  value={newRoute.slug}
                  onChange={(e) => setNewRoute({ ...newRoute, slug: e.target.value })}
                  placeholder="e.g., credssystem"
                />
              </div>
              <div>
                <Label htmlFor="name">Route Name</Label>
                <Input
                  id="name"
                  value={newRoute.name}
                  onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                  placeholder="e.g., CredSystem"
                />
              </div>
              <div>
                <Label htmlFor="botToken">Telegram Bot Token</Label>
                <Input
                  id="botToken"
                  value={newRoute.botToken}
                  onChange={(e) => setNewRoute({ ...newRoute, botToken: e.target.value })}
                  placeholder="Enter bot token"
                />
              </div>
              <div>
                <Label htmlFor="chatId">Telegram Chat ID</Label>
                <Input
                  id="chatId"
                  value={newRoute.chatId}
                  onChange={(e) => setNewRoute({ ...newRoute, chatId: e.target.value })}
                  placeholder="Enter chat ID"
                />
              </div>
              <Button onClick={handleAddRoute}>Add Route</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>{route.name}</TableCell>
                    <TableCell>/{route.slug}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.route.name}</TableCell>
                    <TableCell>
                      <span className={
                        request.status === 'sent' ? 'text-green-500' :
                        request.status === 'error' ? 'text-red-500' :
                        'text-yellow-500'
                      }>
                        {request.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
