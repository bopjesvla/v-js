-- -U postgres -d postgres -h localhost
create table simple(a text, constraint is_c check (a = 'c'))
