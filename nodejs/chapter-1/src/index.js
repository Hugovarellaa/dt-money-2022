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
  res.status(201).send();
});

app.get("/statement", VerifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  // Retornando Statement
  res.send(customer.statement);
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

  res.status(201).json(statementOperation);
});

app.listen(3333, () => console.log("server start on port 3333"));
