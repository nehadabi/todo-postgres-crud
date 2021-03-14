const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const pool = require("./config");
const jwt = require('jsonwebtoken');
const secretKey = 'nehadabi';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.listen(5000, () => {
    console.log("Server started on port 5000");
});

app.get('/', (req, res) => {
    res.send({message:'todo api'});
  });


app.post('/login', (req, res) => {
let body = req.body;
if (body.username == 'neha' && body.password == '123456') {
    let token = jwt.sign({ username: 'neha', role: 'admin' }, secretKey, {
    expiresIn: '1h'
    });
    res.status(200).send({ token });
} else {
    res.status(401).send({ message: 'Error in username or password' });
}
});

function verifyTokenJWT(req, resp, next) {
if (req.url == '/login') {
    next();
}
let token = req.headers['x-access-token'];
try {
    jwt.verify(token, secretKey, (err, decoded) =>{      
    if (err) {
        return res.json({ message: 'token invalid' });
    } else {
        next();
    }
    });
} catch (e) {
    resp.status(500).send({ message: 'token invalid' });
}
}

app.use(verifyTokenJWT);

// create  todo
app.post("/task", async (req, res) => {
    try {
        const { description} = req.body;
        const newTodo = await pool.query("INSERT INTO todotable (description) VALUES($1) RETURNING *", [description]);

        res.json(newTodo.rows[0]);
    } catch (err) {
        console.log(err.message);
    }
});


// get all todos
app.get("/task", async (req, res) => {
    try {
        const allTodos = await pool.query("SELECT * FROM todotable");
        res.json(allTodos.rows);
    } catch (err) {
        console.log(err.message);
    }
});

// get a todo
app.get("/task/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await pool.query("SELECT * FROM todotable WHERE id=$1", [id]);
        res.json(todo.rows[0]);
    } catch (err) {
        console.log(err.message);
    }
});

// delete todo
app.delete("/task/:id",async (req, res) => {
    try {
        const { id } = req.params;
        const deleteTodo = await pool.query("DELETE FROM todotable WHERE id=$1", [id]);
        res.json("Deleted todo");
    } catch (err) {
        console.log(err.message);
    }
});

// edit todo

app.put("/task/:id",async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const editTodo = await pool.query("UPDATE todotable SET description=$1 WHERE id=$2", [description, id]);
        res.json("Updated todo");
    } catch (err) {
        console.log(err.message);
    }
});

