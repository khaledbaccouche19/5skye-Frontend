"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface MaintenanceAnalyticsProps {
  towerId: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function MaintenanceAnalytics({ towerId }: MaintenanceAnalyticsProps) {
  // Mock data - replace with real data from API
  const maintenanceData = [
    { month: 'Jan', completed: 12, scheduled: 8, overdue: 2 },
    { month: 'Feb', completed: 15, scheduled: 6, overdue: 1 },
    { month: 'Mar', completed: 18, scheduled: 10, overdue: 3 },
    { month: 'Apr', completed: 14, scheduled: 7, overdue: 2 },
    { month: 'May', completed: 20, scheduled: 5, overdue: 1 },
    { month: 'Jun', completed: 16, scheduled: 9, overdue: 2 }
  ]

  const statusData = [
    { name: 'Completed', value: 45, color: '#00C49F' },
    { name: 'Scheduled', value: 25, color: '#0088FE' },
    { name: 'In Progress', value: 15, color: '#FFBB28' },
    { name: 'Overdue', value: 10, color: '#FF8042' },
    { name: 'Cancelled', value: 5, color: '#8884D8' }
  ]

  const efficiencyData = [
    { category: 'Preventive', efficiency: 92 },
    { category: 'Corrective', efficiency: 78 },
    { category: 'Emergency', efficiency: 65 },
    { category: 'Predictive', efficiency: 88 }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Maintenance</CardTitle>
            <Badge variant="outline">This Month</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Badge variant="outline">Efficiency</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Badge variant="outline">Hours</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2h</div>
            <p className="text-xs text-muted-foreground">-0.3h from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Efficiency</CardTitle>
            <Badge variant="outline">Savings</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4K</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Trends</CardTitle>
            <CardDescription>Monthly maintenance activity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={maintenanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#00C49F" name="Completed" />
                <Bar dataKey="scheduled" fill="#0088FE" name="Scheduled" />
                <Bar dataKey="overdue" fill="#FF8042" name="Overdue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Current maintenance status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Efficiency by Category</CardTitle>
          <CardDescription>Performance metrics across different maintenance types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {efficiencyData.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-muted-foreground">{item.efficiency}%</span>
                </div>
                <Progress value={item.efficiency} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

