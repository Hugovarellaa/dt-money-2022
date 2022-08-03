const express = require("express");
const { v4: uuidV4 } = require("uuid");

const app = express();
app.use(express.json());

const customers = [];

app.post("/account", (req, res) => {
  const { name, cpf } = req.body;

  const customerAlreadyExists = customers.some(
    (customers) => customers.cpf === cpf
  );
  if (customerAlreadyExists) {
    res.status(404).send({ message: "Customer already exists" });
  }

  const user = {
    id: uuidV4(),
    name,
    cpf,
    statement: [],
  };

  customers.push(user);
  res.status(201).json(user);
});

app.listen(3333, () => console.log("server start on port 3333"));
