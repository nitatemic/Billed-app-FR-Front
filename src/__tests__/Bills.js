/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH, ROUTES } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import BillsContainer from '../containers/Bills.js'
import mockStore from '../__mocks__/store';
import router from '../app/Router.js';
import { describe, expect } from '@jest/globals';

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
}

jest.mock("../app/store", () => mockStore);

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon.classList).toContain("active-icon")
    });
    test('Then bills should be rendered', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const tbody = screen.getByTestId("tbody")
      expect(tbody).toBeTruthy()
      /* tbody should have children */
      expect(tbody.children).toBeTruthy()
    });
    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(
        /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i,
      ).map((a) => a.innerHTML);
      const antiChrono = (a, b) => (new Date(b.date) - new Date(a.date));
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    /* When I click on "Nouvelle note de frais" button, it should redirect to NewBill page */
    describe("When I click on the 'Nouvelle note de frais' button", () => {
      test('Then it should redirect to NewBill page', () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const bill = new BillsContainer({ document, onNavigate, firestore: null, localStorage: window.localStorage });
        const newBillButton = screen.getByTestId('btn-new-bill');
        newBillButton.click();
        expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
      });
    });
    /* Test when I click on the eye icon, it should open a modal */
    describe('When I click on the eye icon', () => {
      test('Then a modal should open', () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const eyeIcon = screen.getAllByTestId('icon-eye');
        eyeIcon.forEach((icon) => {
          icon.click();
          /* Get the aria-hidden attribute of the modal */
          const modal = screen.getByTestId('modal');
          const isModalVisible = modal.getAttribute('aria-hidden');
          expect(isModalVisible).toBe('true');
        });
      });
    });
  });
});

describe("When I navigate to Bills Page", () => {
  test("fetches bills from mock API GET", async () => {

    jest.spyOn(mockStore, "bills");

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "a@a" })
    );

    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.Bills);

    await waitFor(() => expect(screen.getByText("Mes notes de frais")).toBeTruthy());
  });

  test("fetches bills from an API and fails with 404 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });
    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message = screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("fetches messages from an API and fails with 500 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });

    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message = screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
