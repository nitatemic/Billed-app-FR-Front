/* Test for newBills.js and newBillsUI.js */

/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill, { addStatus } from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from "../__mocks__/localStorage.js";
import Router from "../app/Router.js"


describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      document.body.innerHTML = ""
      /* clear localStorage */
      localStorage.clear()
      /* Define the local storage */
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      let root = document.createElement("div")
      root.id = "root"
      document.body.appendChild(root)

      Router()
      window.onNavigate(ROUTES_PATH['NewBill'])
    })
    test("Then the page should render correctly", () => {
      /*      const html = NewBillUI()
						document.body.innerHTML = html*/
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
    test("The mail icon should be active", async () => {
      const iconWindow = await screen.getByTestId("icon-window")
      const iconMail = await screen.getByTestId("icon-mail")
      expect(iconWindow).toBeTruthy()
      expect(iconMail).toBeTruthy()
      await waitFor(() => {
        expect(iconMail.classList.contains("active-icon")).toBeTruthy()
      })
      expect(iconWindow.classList.contains("active-icon")).toBeFalsy()


    })
    it(" Should be able to view the form", async () => {
      await waitFor(() => screen.getByTestId('form-new-bill'))
      const file = screen.getByTestId('file')
      const type = screen.getByTestId('expense-type')
      const name = screen.getByTestId('expense-name')
      const amount = screen.getByTestId('amount')
      const date = screen.getByTestId('datepicker')
      const vat = screen.getByTestId('vat')
      const pct = screen.getByTestId('pct')
      const commentary = screen.getByTestId('commentary')
      const btnSubmit = screen.getByTestId('btn-send-bill')
      expect(file).toBeTruthy()
      expect(type).toBeTruthy()
      expect(name).toBeTruthy()
      expect(amount).toBeTruthy()
      expect(date).toBeTruthy()
      expect(vat).toBeTruthy()
      expect(pct).toBeTruthy()
      expect(commentary).toBeTruthy()
      expect(btnSubmit).toBeTruthy()
    })

    it("Should test if we can send something else than the authorized files", async () => {
      /* reset the html */
      document.body.innerHTML = '';
      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      /!* Define the local storage *!/
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
      const file = new File(['(⌐□_□)'], 'chucknorris.pdf', { type: 'application/pdf' });
      await userEvent.upload(fileInput, file, { applyAccept: false })
      expect(handleChangeFile).toHaveReturnedWith(false);
      await waitFor(() => expect(screen.findByText('Le fichier doit être au format jpg, jpeg ou png'))
      .toBeTruthy());
      !expect(fileInput.files.item(0)).toBe(file);
    })

    it("Should be able to send the form with a picture", async () => {

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      expect(screen.getByTestId('expense-type')).toBeTruthy()
      expect(screen.getByTestId('expense-name')).toBeTruthy()
      expect(screen.getByTestId('amount')).toBeTruthy()
      expect(screen.getByTestId('datepicker')).toBeTruthy()
      expect(screen.getByTestId('vat')).toBeTruthy()
      expect(screen.getByTestId('pct')).toBeTruthy()
      expect(screen.getByTestId('commentary')).toBeTruthy()
      expect(screen.getByTestId('file')).toBeTruthy()
      expect(screen.getByTestId('btn-send-bill')).toBeTruthy()
      /* Complete the form */
      const type = screen.getByTestId('expense-type')
      const name = screen.getByTestId('expense-name')
      const amount = screen.getByTestId('amount')
      const date = screen.getByTestId('datepicker')
      const vat = screen.getByTestId('vat')
      const pct = screen.getByTestId('pct')
      const commentary = screen.getByTestId('commentary')
      userEvent.selectOptions(type, 'Restaurants et bars')
      userEvent.type(name, 'Restaurant')
      userEvent.type(amount, '100')
      userEvent.type(date, '2021-10-10')
      userEvent.type(vat, '20')
      userEvent.type(pct, '20')
      userEvent.type(commentary, 'Restaurant')

      const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
      /* Add picture in the input */
      await userEvent.upload(fileInput, file, { applyAccept: false })

      /*fileInput.addEventListener("change", handleChangeFile);
      await userEvent.upload(fileInput, file)
      */
      expect(fileInput.files.item(0)).toBe(file)
      expect(handleChangeFile).toHaveBeenCalled();
    })
  })
})

describe("Test for addStatus function", () => {
  describe("If I send a type of status, I should get the corresponding DOM element", () => {
    test("Should return a div with the ID 'error-message'", () => {
      const status = "error"
      const DOM = addStatus(status, "test")
      expect(DOM).toBeTruthy()
      expect(DOM.id).toBe("error-message")
    })
    test("Should return a div with the ID 'validation-message'", () => {
      const status = "success"
      const DOM = addStatus(status, "test")
      expect(DOM).toBeTruthy()
      expect(DOM.id).toBe("validation-message")
    })
    test("Should return a null element", () => {
      const status = "other"
      const DOM = addStatus(status, "test")
      expect(DOM).toBeNull()
    })
  })
})
