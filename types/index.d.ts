// App entities
interface INavigation {
  push: (path: string, params?: any) => any;
  navigate: (path: string, params?: any) => any;
  goBack: () => any;
}

interface IRoute {
  key: string;
  path: string;
  name: string;
  params: any;
}

interface IScreen {
  navigation: INavigation;
  route: IRoute;
}

// Database entities
interface ICard {
  id: string;
  createdAt: number;
  updatedAt: number;
  balance: number;
  paymentSystem: string;
  number: string;
  endDate: string;
  colorId: number;
}

interface IGoal {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  description: string;
  finalAmount: number;
  currentAmount: number;
}

interface ITransaction {
  id: string;
  createdAt: number;
  updatedAt: number;
  cardId: string;
  amount: number;
  type: string;
  actionType: string;
}

type IPaymentSystem = "Visa" | "Paypal" | "Mir";
