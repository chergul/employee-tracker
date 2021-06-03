const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
const colors = require('colors');
const logo = require('asciiart-logo');


console.log(
    logo({
        name: 'EMPLOYEE TRACKER',
        font: 'Speed',
        lineChars: 10,
        padding: 2,
        margin: 3,
        borderColor: 'grey',
        logoColor: 'purple',
        
    })
    .emptyLine()
    .right('version 3.7.123')
    .emptyLine()
    .render()
);

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Demir2010.',
  database: 'employee_db',
});

connection.connect((err) => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    start(); 
  });
  
  function start() {
    inquirer.prompt({
        name: "action",
        type:"list",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "View All Employees by Department",
            "View All Employees by Manager",
            "View All Departments",
            "View All Roles",
            "Add New Department",
            "Add New Role",
            "Add New Employee",
            "Remove Department",
            "Remove Role",
            "Remove Employee",
            "Update Employee Role",
            "Update Employee Manager",
            "View the total utilized budget of a department",
            "Quit"
        ]
    }).then(function (answer) {
  
        switch(answer.action) {
  
            case "View All Employees":
                viewAllEmployees();
                break;

            case "View All Employees by Department":
                employeeByDepartment();
                break;

            case "View All Employees by Manager":
                employeeByManager();
                break;

            case "View All Departments":
                allDepartment();
                break;

            case "View All Roles":
                allRoles();
                break;

            case "Add New Department":
                addDepartment();
                break;

            case "Add New Role":
                addRole();
                break;

            case "Add New Employee":
                addNewEmployee();
                break;

            case "Remove Department":
                removeDepartment();
                break;

            case "Remove Role":
                removeRole();
                break;
            
            case "Remove Employee":
                removeEmployee();
                break;

            case "Update Employee Role":
                updateRole();
                break;

            case "Update Employee Manager":
                updateManager();
                break;

            case "View the total utilized budget of a department":
                budgetOfDepartment();
                break;
  
            case "Quit":
                console.table("Thanks for using the Employee Tracker!")
                connection.end();
                break;
  
            default:
                return "There is no way out!"
            
  
            
        }
    });
  }
  const viewAllEmployees = () => {
    var query = "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee";
    query += " LEFT JOIN role on employee.role_id = role.id";
    query += " LEFT JOIN department on role.department_id = department.id";
    query += " LEFT JOIN employee manager on manager.id = employee.manager_id";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("ALL Employees View".green)
        console.table(res);
        start();
    });
};

function employeeByDepartment() {
    inquirer.prompt({
        name: "department",
        type: "list",
        message: "By which department would you like to view the employees?",
        choices: [
            "Sales", 
            "Legal",
            "Finance",
            "IT"
        ]
    }).then(function (answer) {
        var query = `SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS Fullname, department.name AS department
        FROM employee
        LEFT JOIN role on employee.role_id = role.id
        LEFT JOIN department on role.department_id = department.id
        WHERE department.name ="${answer.department}"`;
        connection.query(query, function (err, res) {
            if(err) throw err;
            console.log("All Employees by Department".green)
            console.table(res);
            start();
        });
    })
};

function employeeByManager() {
    connection.query(`SELECT CONCAT(m.first_name, " ", m.last_name) AS Manager, m.id FROM employee INNER JOIN employee m ON employee.manager_id = m.id`, function (err, res) {
       inquirer.prompt({
           name: "manager_id",
           type: "list",
           message: "By which Manager would you like to view the employees?",
           choices: res.map(o => ({ name: o.Manager, value: o.id }))

       }).then(function (answer) {
           var query = `SELECT employee.id, CONCAT(first_name, " ", last_name) AS Name, role.title
           FROM employee INNER JOIN role ON employee.role_id = role.id
           WHERE employee.manager_id = ${answer.manager_id} GROUP BY employee.id`;
           connection.query(query,
            function (err, result) {
                if (err) throw err;
                console.log("Employee by Manager".green)
                console.table(result);
                start();
            });
       })
    });
}

function allDepartment() {
    var query = "SELECT * FROM department";
    connection.query(query, function(err, res) {
        if (err) throw err;
        console.log("All departments".magenta)
        console.table(res);
        start();
    });
}

function allRoles() {
    var query = `SELECT role.id,role.title, role.salary, department.name AS Department
    FROM role
    LEFT JOIN department ON department.id =role.department_id
    ORDER BY role.id `;
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("All Roles".magenta)
        console.table(res);
        start();
    });
}

function addDepartment() {
    inquirer.prompt([{
        message: "What department would you like to add?",
        type: "input",
        name: "newDepartment"
    }]).then(answer => {
        connection.query(`INSERT INTO department (name) VALUES ("${answer.newDepartment}")`, function (err, res) {
            if (err) throw err;
            console.log(`New department ${answer.newDepartment} has been successfully added`.yellow);
            start();
        });
    })
}

function addRole() {
    connection.query("SELECT * FROM department", function (req, res) {
        inquirer.prompt([{
            message: "What is the new Role Title?",
            type: "input",
            name: "newTitle"
        }, {
            message: "What is the salary for this role?",
            type: "input",
            name: "newSalary"
        }, {
            message: "To which department would you like to assign this new role?",
            type: "list",
            name: "roleID",
            choices: res.map(item => ({ name: item.name, value: item.id }))

        }]).then(answer => {
            connection.query(`INSERT INTO role(title, salary, department_id) VALUES ('${answer.newTitle}', '${answer.newSalary}', ${answer.roleID})`, function (err, res) {
                if (err) throw err;
                console.log(`New role has been successfully added`.yellow);
                start();
            });
        });
    });
}

function addNewEmployee() {
    connection.query(`SELECT CONCAT(first_name, " ", last_name) AS Manager, id FROM employee`, function (err, res) {
        connection.query(`SELECT DISTINCT title, id from role`, function (err, data) {
            inquirer.prompt([{
                message: "What is the employee's first name?",
                type: "input",
                name: "first_name"
            }, {
                message: "What is the employee's last name?",
                type: "input",
                name: "last_name"
            }, {
                message: "What is the employee's role?",
                type: "list",
                name: 'role_id',
                choices: data.map(o => ({ name: o.title, value: o.id }))
  
            }, {
                message: "Who will be this employee's Manager?",
                type: "list",
                name: 'manager_id',
                choices: res.map(o => ({ name: o.Manager, value: o.id }))
  
            }]).then(answer => {
                connection.query(`INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ('${answer.first_name}', '${answer.last_name}', ${answer.role_id}, ${answer.manager_id})`, function (err, res) {
                    if (err) throw err;
                    console.log("------------")
                    console.log(`New employee ${answer.first_name} ${answer.last_name} has been successfully added`.yellow);
                    console.log("------------")
                    start();
                });
            });
        });
    });
  };

  function removeDepartment() {
    connection.query("SELECT name, id FROM department", function (err, res) {

        const departmentChoices = res.map(item => {
            return {
                name: item.name,
                value: item.id
            }
        });

        inquirer.prompt([{
            message: "Which department would you like to remove?",
            type: "list",
            name: "removedDepartment",
            choices: departmentChoices
        }]).then(function (answer) {

            const thisDepartment = departmentChoices.filter(item => item.value === answer.removedDepartment);
            var query = `DELETE FROM department WHERE id = "${answer.removedDepartment}"`;
            connection.query(query, function (err, res) {
                if (err) throw err;
                console.log(`Department ${thisDepartment[0].name} has been successfully removed`.red);
                start();
            });
        });
    });
};
  
function removeRole() {
    connection.query("SELECT title, id FROM role", function (req, res) {
        const roleChoices = res.map(item => ({ name: item.title, value: item.id }));

        inquirer.prompt([{
            message: "Which role would you like to remove?",
            type: "list",
            name: "removeRoleChoice",
            choices: roleChoices
        }]).then(function (answer) {
            const thisRole = roleChoices.filter(item=> item.value === answer.removeRoleChoice);
            var query = `DELETE FROM role WHERE id = "${answer.removeRoleChoice}"`;
            connection.query(query, function (err, res) {
                if (err) throw err;
                console.log(`Role ${thisRole[0].name} has been successfully removed`.red);
                start();
            });
        });
    });
}

function removeEmployee() {
    var query = "SELECT CONCAT(first_name, ' ', last_name) AS fullName, id FROM employee";
    connection.query(query, async function (err, res) {

        const employeeChoices = res.map(item => {
            return {
                name: item.fullName,
                value: item.id
            }
        });

        inquirer.prompt([{

            type: "list",
            name: "employeeId",
            message: "Which employee do you want to remove?",
            choices: employeeChoices
        }]).then(function (answer) {

            const thisUser = employeeChoices.filter(item => item.value === answer.employeeId);
            var query = `DELETE FROM employee WHERE id = "${answer.employeeId}"`;
            connection.query(query, function (err, res) {
                if (err) throw err;
                console.log(`Employee ${thisUser[0].name} has been successfully removed`.red);
                start();
            });
        })
    });
};

function updateRole() {
    connection.query(`SELECT CONCAT(first_name, " ", last_name) AS Employee, id FROM employee`, function (err, res) {
        connection.query(`SELECT title, id from role`, function (err, data) {
            inquirer.prompt([{
                message: "What is the name of the employee that you would like to update a role?",
                type: "list",
                name: "updatedEmployee",
                choices: res.map(o => ({ name: o.Employee, value: o.id }))
            }, {
                message: "What is the employee's new role?",
                type: "list",
                name: 'role_id',
                choices: data.map(o => ({ name: o.title, value: o.id }))

            }]).then(answer => {
                connection.query(`UPDATE employee SET role_id = "${answer.role_id}" WHERE id= "${answer.updatedEmployee}"`, function (err, res) {
                    if (err) throw err;
                    console.log("Employee's role has been successfully updated".green)

                    start();
                });
            });
        });
    });
}

function updateManager() {
    connection.query(`SELECT CONCAT(first_name, " ", last_name) AS Employee, id FROM employee`, function (err, res) {
        connection.query(`SELECT CONCAT(first_name, " ", last_name) AS Manager, id FROM employee`, function (err, data) {
            inquirer.prompt([{
                message: "What is the name of the employee that you would like to update the Manager?",
                type: "list",
                name: "employeeID",
                choices: res.map(o => ({ name: o.Employee, value: o.id }))

            }, {
                message: "Who is the employee's new Manager?",
                type: "list",
                name:'managerID',
                choices: data.map(o => ({ name: o.Manager, value: o.id }))

            }]).then(answer => {
                connection.query(`UPDATE employee SET manager_id ="${answer.managerID}" WHERE id="${answer.employeeID}"`, function (err, res) {
                    if (err) throw err;
                    console.log("Employee's manager has been successfully updated".green)
                    start();
                });
            });
        });
    });
}
function budgetOfDepartment() {
    var query = "SELECT department.id, department.name, SUM(role.salary) AS utilized_budget FROM employee";
    query += " LEFT JOIN role on employee.role_id = role.id";
    query += " LEFT JOIN department on role.department_id = department.id";
    query += " GROUP BY department.id, department.name";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log(`View budget of a department`.yellow);
        console.table(res);
        start();
    });
}