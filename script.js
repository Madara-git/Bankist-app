'use strict';
// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2024-04-01T10:17:24.185Z',
    '2024-11-09T14:11:59.604Z',
    '2024-12-07T17:01:17.194Z',
    '2024-12-10T20:36:17.929Z',
    '2024-12-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'en-us', // de-DE
};
const account2 = {
  owner: 'Mohamed Mostafa',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2024-12-08T14:43:26.374Z',
    '2024-12-10T18:49:59.371Z',
    '2024-12-12T12:01:20.894Z',
  ],
  currency: 'EGP',
  locale: 'AR-EG',
};
const accounts = [account1, account2];
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

function formatingMovementsDate(date, locale) {
  const daysPassed = clacdaysPassed(new Date(), date);

  function clacdaysPassed(date1, date2) {
    return Math.floor(Math.abs((date2 - date1) / 1000 / 60 / 60 / 24));
  }

  if (daysPassed === 0) return locale === 'AR-EG' ? 'اليوم' : 'Today';
  if (daysPassed === 1) return locale === 'AR-EG' ? 'امس' : 'Yester days ';
  if (daysPassed <= 7)
    return locale === 'AR-EG'
      ? `منذ ${daysPassed} ايام`
      : `${daysPassed} days ago`;

  const option = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };
  return new Intl.DateTimeFormat(locale, option).format(date);
}

function NumberLocaleDisplay(sum) {
  return new Intl.NumberFormat(currentAccount.locale, {
    style: 'currency',
    currency: currentAccount.currency,
  }).format(sum);
}

function displayMovements(acc, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatingMovementsDate(date, acc.locale);
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">$${i} ${type}</div>
      <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${NumberLocaleDisplay(mov)}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

function calcPrintBalance(acc) {
  acc.balance = acc.movements.reduce((acc, el) => acc + el, 0);
  labelBalance.innerHTML = NumberLocaleDisplay(acc.balance);
}

function calcDisplaySummary(acc) {
  let incomes = acc.movements
    .filter(mov => mov >= 0)
    .reduce((acc, mov) => acc + mov, 0);
  let withdraw = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  let interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(el => el >= 1)
    .reduce((acc, dep) => acc + dep, 0);
  labelSumIn.textContent = NumberLocaleDisplay(incomes);
  labelSumOut.textContent = NumberLocaleDisplay(withdraw);
  labelSumInterest.textContent = NumberLocaleDisplay(interest);
}

function createUserName(name) {
  name.forEach(val => {
    val.userName = val.owner
      .toLowerCase()
      .split(' ')
      .map(val => val[0])
      .join('');
  });
}

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  let loan = currentAccount.movements.some(mov => mov >= amount * 0.1);
  inputLoanAmount.value = '';
  let spinner = document.querySelector('.form__label--loan + span');
  spinner.style.display = 'inline-block';
  if (amount > 0 && loan) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
      spinner.style.display = 'none';
      clearInterval(tiemIntervel);
      startLogoutTimer();
    }, 3000);
  }
});

createUserName(accounts);

let currentAccount;
//fake login
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = '1';
///////////////////////////////////

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

let tiemIntervel;
function startLogoutTimer() {
  let time = 300;
  function tick() {
    const minutes = `${Math.floor(time / 60)}`.padStart(2, '0');
    const seconds = `${time % 60}`.padStart(2, '0');
    labelTimer.innerHTML = `${minutes}:${seconds}`;

    if (time === 0) {
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = '0';
      clearInterval(tiemIntervel);
    }
    time--;
  }
  tick();
  tiemIntervel = setInterval(tick, 1000);
}

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    account => account.userName === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = '1';
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      weekday: 'long',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginPin.blur();
    updateUI(currentAccount);

    clearInterval(tiemIntervel);
    startLogoutTimer();
  }
});

function updateUI(acc) {
  displayMovements(acc);
  calcPrintBalance(acc);
  calcDisplaySummary(acc);
}

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  let reciverAccount = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );
  inputTransferAmount.value = '';
  inputTransferTo.value = '';
  inputTransferAmount.blur();
  if (
    reciverAccount &&
    amount > 0 &&
    currentAccount.balance >= amount &&
    reciverAccount.owner !== currentAccount.owner
  ) {
    reciverAccount.movements.push(amount);
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    reciverAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);

    clearInterval(tiemIntervel);
    startLogoutTimer();
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.userName &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.userName === inputCloseUsername.value
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = '0';
    inputCloseUsername.value = inputClosePin.value = '';
  }
});
