/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(
        /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => (new Date(b.date) - new Date(a.date))
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    /* When I click on "Nouvelle note de frais" button, it should redirect to NewBill page */
    describe("When I click on the 'Nouvelle note de frais' button", () => {
      test("Then it should redirect to NewBill page", () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const newBillButton = screen.getByTestId('btn-new-bill')
        newBillButton.click()
        expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
      })
    })
    /* Test when I click on the eye icon, it should open a modal */
    describe("When I click on the eye icon", () => {
      test("Then a modal should open", () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const eyeIcon = screen.getAllByTestId('icon-eye')
        eyeIcon.forEach(icon => {
          icon.click()
          /* Get the aria-hidden attribute of the modal */
          const modal = screen.getByTestId('modal')
          const isModalVisible = modal.getAttribute('aria-hidden')
          expect(isModalVisible).toBe('true')
        })
      })
    })
  })
})
