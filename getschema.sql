-- -h localhost -U postgres -d SLAPTCHA
with requested_columns as (
	select * from information_schema.columns
	where 1=1
),
column_constraints as (
	select table_schema, table_name, column_name, constraint_name, constraint_schema, check_clause from information_schema.constraint_column_usage 
	full outer join information_schema.table_constraints -- add constraints that don't use any columns, like check(date_part('month', now()) = 12)
	using(table_schema, table_name, constraint_name, constraint_schema)
	inner join information_schema.check_constraints -- ditch non-check constraints, add check expression
	using(constraint_schema, constraint_name)
	union all
	select table_schema, table_name, column_name, format('%s_%s', column_name, constraint_name) as constraint_name,
		constraint_schema, replace(check_clause, 'VALUE', column_name) as check_clause from information_schema.column_domain_usage
	full outer join information_schema.domain_constraints
	using(domain_name, domain_schema, domain_catalog)
	inner join information_schema.check_constraints -- ditch non-check constraints, add check expression
	using(constraint_schema, constraint_name)
),
joined as (
	select * from requested_columns
	left join column_constraints a
	using(table_schema, table_name, column_name)
	where not exists ( -- exclude constraints that work with columns (even partially) outside the scope of the request
		select table_name, column_name from information_schema.constraint_column_usage b
		where a.table_name=b.table_name and a.constraint_name=b.constraint_name
		except select table_name, column_name from requested_columns
	)
), 
by_column as (
	select table_name, column_name, array_agg(constraint_name::text) filter (where constraint_name is not null) checks, is_nullable, column_default from joined
	group by table_name, column_name, is_nullable, column_default	
),
by_table as (
	select table_name, array_agg(distinct constraint_name::text) checks from joined
	where constraint_name is not null
	group by table_name
),
check_constraints as (
	select distinct constraint_name, check_clause from joined where constraint_name is not null
)
select
(select json_agg(c.*) from by_column c) as columns,
(select json_agg(c.*) from by_table c) as tables,
(select json_object(array_agg(constraint_name::text), array_agg(check_clause::text)) from check_constraints) as checks
