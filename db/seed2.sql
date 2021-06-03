USE employee_db;

INSERT INTO department (name)
VALUES ('Sales'), ('Legal'), ('Finance'), ('IT');

INSERT INTO role (title, salary, department_id)
VALUES ('Sales Lead', 100000, 1), ('Salesperson', 80000, 1), ('Lead Engineer', 150000, 2), ('Software Engineer', 120000, 2), ('Accountant', 125000, 3), ('Legal Team Lead', 250000, 4), ('Lawyer', 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES ('Seza ', 'Herman', 1, null), ('Aliyah', 'Frank', 3, null), ('Elcin', 'Panahi', 4, 2), ('Ali', 'Panahi', 6, null), ('Mary', 'Frank', 2, 1), ('Ismail', 'Tistis', 2, 1);
