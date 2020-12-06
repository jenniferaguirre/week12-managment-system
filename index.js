const mysql = require("mysql");
const inquirer = require("inquirer");
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employee_db"
});

connection.connect(function (err) {
    if(err) throw err;
    start();
});

function start() {
    inquirer
        .prompt({
            name: "userInput",
            type: "list",
            message:
            "Which of the following would you like to navigate to?",
            choices: ["VIEW_DEPARTMENT", "VIEW_ROLE", "VIEW_EMPLOYEE", "ADD_DEPARTMENT", "ADD_ROLE", "ADD_EMPLOYEE", "UPDATE_EMPLOYEE_ROLE", "DELETE_DEPARTMENT", "DELETE_EMPLOYEE", "EXIT"],
        })
        .then(function (answer) {
            if (answer.userInput === "VIEW_DEPARTMENT") {
                viewDepartment();
            } else if (answer.userInput === "VIEW_ROLE") {
                viewRole();
            } else if (answer.userInput === "VIEW_EMPLOYEE") {
                viewEmployee();
            } else if (answer.userInput === "ADD_DEPARTMENT") {
                addDepartment();
            } else if (answer.userInput === "ADD_ROLE") {
                addRole();
            } else if (answer.userInput === "ADD_EMPLOYEE") {
                addEmployee();
            } else if (answer.userInput === "UPDATE_EMPLOYEE_ROLE") {
                updateEmployeeRole();
            } else if (answer.userInput === "DELETE_DEPARTMENT") {
                deleteDepartment();
            } else if (answer.userInput === "DELETE_EMPLOYEE") {
                deleteEmployee();
            } else {
                connection.end();
            }
        });
}

function backToStart() {
    inquirer
        .prompt({
            name: "userInput",
            type: "list",
            message:
                "Return to the Main Menu?",
            choices: ["MAIN_MENU", "EXIT"]
        })
        .then(function (answer) {
            if (answer.userInput === "MAIN_MENU") {
                start();
            }
            else {
                connection.end();
            }
        });
}

function viewDepartment() {
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        console.table(results);
        backToStart();
    });
}

function viewRole() {
    connection.query(`select title, salary, name from role inner join department on role.department_id=department.id`, function (err, results) {
        if (err) throw err;
        console.table(results);
        backToStart();
    });
}

function viewEmployee() {
    connection.query(`select first_name, last_name, title, salary, name from employee inner join role on employee.role_id=role.id inner join department on role.department_id=department.id`, function (err, results) {
        if (err) throw err;
        console.table(results);
        backToStart();
    });
}

function printResults (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " deleted.");
    backToStart();
}

function deleteDepartment() {
    connection.query("SELECT * FROM department", function (err, results) {
        inquirer.prompt([
            {
                name: "name",
                type: "list",
                message: "Which of the following departments would you like to delete?",
                choices: function() {
                    var choiceArray = ["Go Back"];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].name);
                    }
                    return choiceArray;
                }
            }
        ]).then(function(answer) {
            if (answer.name === "Go Back") {
                start();
            }
            else {
                connection.query (`DELETE FROM department WHERE name = '${answer.name}'`, printResults );
            }
        })
    })
};

function deleteEmployee() {
    connection.query("SELECT * FROM employee", function (err, results) {
        inquirer.prompt([
            {
                name: "name",
                type: "list",
                message: "Which of the following employees would you like to delete?",
                choices: function() {
                    var choiceArray = ["Go Back"];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].last_name);
                    }
                    return choiceArray;
                }
            }
        ]).then(function(answer) {
            if (answer.name === "Go Back") {
            start();
            }
            else {
                connection.query (`DELETE FROM employee WHERE last_name = '${answer.name}'`, printResults );
            }
        })
    })
};

async function addDepartment() {
    const department = await inquirer.prompt([
        {
            name: "name",
            message: "What is the name of the department"
        }
    ])
    connection.query (`insert into department (name) values ('${department.name}')`, printResults)
}

function addRole() {
    connection.query ("SELECT * FROM department", async function(err, results) {
        const department = results.map ( (result) => ({
            name:result.name,
            value:result.id
        }))
        const roleInfo = await inquirer.prompt([
            {
                name: "title",
                message: "What is the position's title?"
            },
            {
                name: "salary",
                message: "What is the position's salary?"
            },
            {
                type: "list",
                name: "department_id",
                message: "The role belongs to which department?",
                choices:department
            }
        ])
        connection.query (`insert into role (title, salary, department_id) values('$${roleInfo.title}','${roleInfo.salary}','${roleInfo.department_id}')`, printResults)
    })
}

function addEmployee() {
    connection.query ("SELECT * FROM role", async function(err, results) {
        const role = results.map ( (result) => ({
            name:result.title,
            value:result.id
        }))
        const employeeInfo = await inquirer.prompt([
            {
                name: "first_name",
                message: "What is the employee's first name?"
            },
            {
                name: "last_name",
                message: "What is the employee's last name?"
            },
            {
                type: "list",
                name: "role_id",
                message: "What is the role of this employee?",
                choices:role
            }
        ])
        connection.query (`insert into employee (first_name, last_name, role_id) values('$${employeeInfo.first_name}','${employeeInfo.last_name}','${employeeInfo.role_id}')`, printResults)
    })
}

function updateEmployeeRole() {
    connection.query("SELECT * FROM employee", function (err, employee) {
        connection.query ("SELECT * FROM role", async function (err, role) {
            const roleChoice = role.map ((role)=> ({
                name:role.title,
                value:role.id
            }))
            const employeeChoice = employee.map ((employee) => ({
                name:employee.first_name + " " + employee.last_name,
                value:employee.id
            }))
            const updateEmployee = await inquirer.prompt([
                {
                    type: "list",
                    name: "employee_id",
                    message: "Which employee's role would you like to update?",
                    choices:employeeChoice
                },
                {
                    type: "list",
                    name: "role_id",
                    message: "What new role would you like to assign to that employee?",
                    choices:roleChoice
                }
            ])
            connection.query (`update employee set role_id=${updateEmployee.role_id} where id=${updateEmployee.employee_id}`, printResults)
        })
    })
}