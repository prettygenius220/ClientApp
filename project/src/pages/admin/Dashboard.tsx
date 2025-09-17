import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import CourseManagement from './CourseManagement';
import UserManagement from '../../components/admin/UserManagement';
import LeadManagement from '../../components/admin/LeadManagement';
import CertificateList from '../../components/admin/CertificateList';
import EmailTestPanel from '../../components/admin/EmailTestPanel';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage courses, users, leads, and certificates</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="email-test">🔧 Email Test</TabsTrigger>
        </TabsList>
        <TabsContent value="courses">
          <CourseManagement />
        </TabsContent>
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        <TabsContent value="leads">
          <LeadManagement />
        </TabsContent>
        <TabsContent value="certificates">
          <CertificateList />
        </TabsContent>
        <TabsContent value="email-test">
          <EmailTestPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}