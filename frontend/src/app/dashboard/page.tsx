'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  FileText,
  GraduationCap,
  LogOut,
  User,
  Settings,
  Bell,
} from 'lucide-react';
import { UserRole } from '@/types/auth';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const isRH = user?.role === UserRole.RH;

  const stats = [
    {
      title: 'Formations disponibles',
      value: '12',
      icon: GraduationCap,
      description: 'Formations actives',
      color: 'bg-blue-500',
    },
    {
      title: 'Documents',
      value: '45',
      icon: FileText,
      description: 'Documents accessibles',
      color: 'bg-green-500',
    },
    ...(isRH
      ? [
          {
            title: 'Utilisateurs',
            value: '128',
            icon: Users,
            description: 'Collaborateurs inscrits',
            color: 'bg-purple-500',
          },
        ]
      : []),
    {
      title: 'Notifications',
      value: '3',
      icon: Bell,
      description: 'Nouvelles notifications',
      color: 'bg-orange-500',
    },
  ];

  const quickActions = isRH
    ? [
        { label: 'Créer une formation', icon: GraduationCap, href: '#' },
        { label: 'Ajouter un document', icon: FileText, href: '#' },
        { label: 'Gérer les utilisateurs', icon: Users, href: '#' },
      ]
    : [
        { label: 'Mes formations', icon: GraduationCap, href: '#' },
        { label: 'Documents', icon: FileText, href: '#' },
        { label: 'Mon profil', icon: User, href: '#' },
      ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Tableau de bord</h1>
                  <p className="text-sm text-muted-foreground">
                    Plateforme de Formation RH
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.full_name || user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {isRH ? 'Administrateur RH' : 'Collaborateur'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold mb-2">
              Bienvenue, {user?.full_name?.split(' ')[0] || 'Utilisateur'} !
            </h2>
            <p className="text-muted-foreground">
              {isRH
                ? 'Gérez les formations et les documents de votre entreprise'
                : 'Consultez vos formations et documents assignés'}
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={item}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.color} p-2 rounded-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Accédez rapidement aux fonctionnalités principales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <action.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>
                  Vos dernières actions sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Bienvenue sur la plateforme
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Votre compte a été créé avec succès
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Maintenant
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
