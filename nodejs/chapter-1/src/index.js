const express = require("express");
const { v4: uuidV4 } = require("uuid");

const app = express();
app.use(express.json());

// Middleware
function VerifyIfExistsAccountCPF(req, res, next) {
  const { cpf } = req.headers;

  // Validando CPF existente
  const customer = customers.find((customer) => customer.cpf === cpf);

  // Se nao existir dá error
  if (!customer) {
    res.status(404).send({ message: "Customer not found" });
  }

  req.customer = customer;
  return next();
}

// Função para saber se o saque pode ser realizado
function getBalance(amount) {
  const balance = amount.reduce((acc, operation) => {
    if (operation.type === "deposit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);
  return balance;
}

const customers = [];

app.post("/account", (req, res) => {
  const { name, cpf } = req.body;

  //Validando CPF existente
  const customerAlreadyExists = customers.some(
    (customers) => customers.cpf === cpf
  );
  if (customerAlreadyExists) {
    res.status(404).send({ message: "Customer already exists" });
  }

  //Criando CPF se nao existe
  const user = {
    id: uuidV4(),
    name,
    cpf,
    statement: [],
  };

  customers.push(user);
  return res.status(201).send();
});

app.get("/statement", VerifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  // Retornando Statement
  return res.send(customer.statement);
});

app.post("/deposit", VerifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { description, amount } = req.body;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "deposit",
  };
  customer.statement.push(statementOperation);

  return res.status(201).json(statementOperation);
});

app.post("/withdraw", VerifyIfExistsAccountCPF, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;

  const balance = getBalance(customer.statement);
  if (balance < amount) {
    return res.status(400).send({ message: "Insufficient funds" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "withdraw",
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();
});

app.get("/statement/date", VerifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  // Código menor do que o de baixo
  const statement = customer.statement.filter((operation) =>
    operation.created_at.toISOString().includes(date)
  );

  // const dateFormatted = new Date(date + " 00:00");
  // const statementOperation = customer.statement.filter(
  //   (statement) =>
  //     statement.created_at.toDateString() ===
  //     new Date(dateFormatted).toDateString()
  // );

  return res.json(statement);
});

app.put("/account", VerifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { name } = req.body;

  customer.name = name;
  return res.status(200).send();
});

app.get("/account", VerifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  return res.json(customer);
});

app.listen(3333, () => console.log("server start on port 3333"));
