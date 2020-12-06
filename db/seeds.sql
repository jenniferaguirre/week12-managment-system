insert into department  (name)
values ('Corporate'),('Sales'),('Finance'),('Pharmacy');

select * from department; 

insert into role (title, salary, department_id)
values ('Human Resources',100000,1), ('Sales Rep',500000,2),('Accountant',120000,3),('Pharmacist',700000,4);

select * from role;

insert into employee (first_name, last_name, role_id)
values ('Michelle','Service',1),('Stephanie','Smith',2),('Debbie','Foo',3),('Jason','Luna',4);

select * from employee;

select title, salary, name from role 
inner join department on role.department_id=department.id;

select first_name, last_name, title, salary, name from employee 
inner join role on employee.role_id=role.id 
inner join department on role.department_id=department.id;