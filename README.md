# v-js

A Postgres table:

```sql
$ psql -U cardinal_li -d db -h localhost
psql (9.4.9)
Type "help" for help.

create table users (
  email text unique constraint valid_email check(email like '%_@_%') not null,
  title text constraint password_length check(length(title) < 20) not null,
  virtue int constraint valid_virtue check(virtue >= 0) not null default 10
);
```

Extract the `public` schema, transpile SQL to JavaScript using [alasql](https://github.com/agershun/alasql):

```bash
npm -g i v-js
v-js -U postgres -d db -h localhost --out schema.v.js
```

Now, without touching the database:

```js
var schema = require('./schema.v.js')

schema('users').validate({email: "Mors Ride", title: "hahahaha", virtue: -2})
/* -> {error: "constraint_violated", violated: [{
  name: "valid_email", columns: ["email"]
}, {
  name: "valid_virtue", columns: ["virtue"]
}]} */
```

# Building

API interface:

```js
v = require("v-js")
v({
  client: {username: "surveillant_mohammed", password: "mhmm", ...}, // pg client or pg config
  schema: "wards", // database schema, defaults to `public`
  tables: { // defaults to all tables
    stimuli: true, // include all columns of the `stimuli` table
    detergents: ["name", "quantity"] // only include columns `name` and `quantity` and their constraints
  },
  
  // While reading directly from a database is supported to a higher extent, v-js can also read primitive
  // SQL table definitions. If you use multiple sources, v-js will combine everything into one
  // JavaScript schema.
  sql: "create table nothing_masters (user_id int)",
}, function(res,err) {
  // if no errors occurred, res is a String of JavaScript code
})
```

The CLI is a yargs wrapper around the API, with additional --file and --out options:

```bash
v-js --client.username surveillant_mohammed --client.password mhmm --schema wards --tables.stimuli --tables.detergents name,quantity --file nothing_masters.sql --out schema.v.js
```

Aliases are defined [here](https://github.com/bopjesvla/v-js/blob/master/bin.js):

```bash
v-js -U surveillant_mohammed -p mhmm --schema wards -t.stimuli -t.detergents name,quantity -f nothing_masters.sql --out schema.v.js
```

# Validating

```js
var schema = require('./schema.v.js')

schema('users').validate({email: "a@b", title: "Priest"})
// {success: true}
schema('users').validate({email: "a@b"})
/* -> {error: "constraint_violated", violated: [{
  name: "not_null", columns: ["title"]
}]} */
schema('users').validate({email: "a@b"}, {partial: true})
// {success: true}
schema('users').validate({email: "a@b", title: "Priest", hope: 25})
// {error: "unknown_field", violated: "hope"}
schema('users').validate({email: "a@b", title: "Priest", hope: 5}, {unknown: false})
// {success: true}
schema('users').defaults()
// {email: undefined, title: undefined, virtue: 10}
schema('users').validate({email: "a@b", title: "Priest"}, {defaults: false})
/* -> {error: "constraint_violated", violated: [{
  name: "not_null", columns: ["virtue"]
}]} */
```
