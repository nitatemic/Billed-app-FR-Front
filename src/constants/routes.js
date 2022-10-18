import LoginUI from "../views/LoginUI.js"
import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import DashboardUI from "../views/DashboardUI.js"
import ErrorPage from '../views/ErrorPage.js';

/* A constant that holds the pathnames of the different routes in the application. */
export const ROUTES_PATH = {
  Login: '/',
  Bills: '#employee/bills',
  NewBill: '#employee/bill/new',
  Dashboard: '#admin/dashboard',
  /* 404 Error Page */
  ErrorPage: '#error'
}

/**
 * It takes in the current pathname, data, error, and loading state, and returns the appropriate UI
 * component based on the pathname
 * @returns A function that returns a component based on the pathname.
 */
export const ROUTES = ({ pathname, data, error, loading }) => {
  switch (pathname) {
    case ROUTES_PATH['Login']:
      return LoginUI({ data, error, loading })
    case ROUTES_PATH['Bills']:
      return BillsUI({ data, error, loading })
    case ROUTES_PATH['NewBill']:
      return NewBillUI()
    case ROUTES_PATH['Dashboard']:
      return DashboardUI({ data, error, loading })
    case ROUTES_PATH['ErrorPage']:
      return ErrorPage(error)
    default:
      return ErrorPage(404)
  }
}

