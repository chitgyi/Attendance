/**
 * Define all of your application routes here
 * for more information on routes, see the
 * official documentation https://router.vuejs.org/en/
 */
export default [
  {
    path: '/face-recognize',
    // Relative to /src/views
    view: 'FaceRecognize'
  },
  {
    path: '/add-employee',
    name: 'Add Employee',
    view: 'AddEmployee'
  },
  {
    path: '/attend',
    name: 'Attended List',
    view: 'Attended'
  },
  {
    path: '/employee-list',
    name: 'Employee Management',
    view: 'EmployeeList'
  },
  {
    path: '/icons',
    view: 'Icons'
  },
]
