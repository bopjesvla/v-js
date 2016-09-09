-- -U postgres -d postgres -h localhost
create table simple(a text, constraint is_c check (a = 'c'));
create table users(id int not null default nextval('seq'), virtue float, email text not null, password text not null, tagline text check(char_length(tagline) > 6)) 
