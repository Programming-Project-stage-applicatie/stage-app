export const getDashboardRouteByRole = (role) => {
  switch (role) {
    case "student":
      return "/dashboard/student";
    case "teacher":
      return "/dashboard/teacher";
    case "mentor":
      return "/dashboard/mentor";
    case "internship_committee":
      return "/dashboard/internship-committee";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/login";
  }
};