export const getDashboardRoute = (role) => {
  switch (role?.toLowerCase()) {
    case 'student':
      return '/dashboard/student';
    case 'instructor':
      return '/dashboard/instructor';
    case 'partner':
      return '/dashboard/partner';
    case 'college_admin':
      return '/dashboard/college';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/role-selection';
  }
};
