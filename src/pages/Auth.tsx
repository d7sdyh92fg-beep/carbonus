import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Auth = () => {
  // Since email authentication is removed, redirect to admin
  return <Navigate to="/admin" replace />;
};

export default Auth;