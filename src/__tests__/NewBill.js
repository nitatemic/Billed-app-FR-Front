/* Test for newBills.js and newBillsUI.js */

/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import '@testing-library/jest-dom'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import { ROUTES } from '../constants/routes.js';
import { localStorageMock } from "../__mocks__/localStorage.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {
    it(" Should be able to view the form", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

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

    it("Should test if we send something else than the authorized files", async () => {
      /* Create a new file */
      const file = new File(['(⌐□_□)'], 'chucknorris.pdf', { type: 'application/pdf' });
      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
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

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
      fireEvent.change(fileInput, {
        target: {
          files: [file]
        }
      });
      expect(handleChangeFile).toHaveBeenCalled();
      await waitFor(() => screen.getByTestId('error-message'))
      expect(screen.getByTestId('error-message')).toBeTruthy()
    })

    it("Shouldn't be able to choose a send a file that is not a .jpg, .jpeg or .png", async () => {
      /* Test handleChangeFile */
      const html = NewBillUI()
      document.body.innerHTML = html
      const fileInput = screen.getByTestId('file')
      /* Create a new pdf file */
      const pdfFile = new File(['pdf'], 'pdf.pdf', { type: 'application/pdf' })
      /* Put the file in the file input */
      Object.defineProperty(fileInput, 'files', {
        value: [pdfFile]
      })
      /* Trigger handleChangeFile */
      fileInput.dispatchEvent(new Event('change'))
      /* Check if the error message is displayed */
      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toBeTruthy()
      expect(errorMessage).toHaveTextContent('Le fichier doit être au format jpg, jpeg ou png.')
    })
  })
})
