# v-js

A schema:

```sql
$ psql -U cardinal_li -d db -h localhost
psql (9.4.9)
Type "help" for help.

SLAPTCHA=# \d
                             List of relations
 Schema |                    Name                    |   Type   |  Owner   
--------+--------------------------------------------+----------+----------
 public | users                                      | table    | postgres

SLAPTCHA=# \d users
Table "public.users"
 Column |  Type   |      Modifiers      
--------+---------+---------------------
 email  | text    | not null
 title  | text    | not null
 virtue | integer | not null default 10
Indexes:
    "users_email_key" UNIQUE CONSTRAINT, btree (email)
Check constraints:
    "title_length" CHECK (length(title) < 20)
    "valid_email" CHECK (email ~~ '%_@_%'::text)
    "valid_virtue" CHECK (virtue >= 0)
```

A command that extracts the schema information and transpiles constraints and defaults to JavaScript:

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

## Building

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
  
  // v-js has basic support for reading SQL directly from a string. If you specify both
  // `client` and `sql`, v-js will combine everything into one JavaScript schema.
  sql: "create table nothing_masters (user_id int)",
}, function(res,err) {
  // if no errors occurred, res is a string of messy JavaScript
})
```

The CLI is a yargs wrapper around the API, with additional --file and --out options:

```bash
v-js --client.username surveillant_mohammed --client.password mhmm --schema wards --tables.stimuli --tables.detergents name,quantity --file nothing_masters.sql --out schema.v.js
```

Shorthands are defined [here](https://github.com/bopjesvla/v-js/blob/master/bin.js):

```bash
v-js -U surveillant_mohammed -p mhmm --schema wards -t.stimuli -t.detergents name,quantity -f nothing_masters.sql --out schema.v.js
```

## Validating

Using the first example schema:

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
schema('users').validate({email: "a@b"}, {columns: ["email"]})
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
schema('users').validate({email: "a@b", virtue: -2}, {checks: ["valid_email"]})
// {success: true}
schema('users').validate({email: "ab", title: "Priest", virtue: 5}, {checks: {valid_email: false}})
// {success: true}
```

## Limitations & Troubleshooting & Things to Do

Limitations of v-js:

- Limited support for major databases other than Postgres (Alasql and v-js aim to be SQL-compliant; v-js favors Postgres when other incompatibilities arise)
- Limited implementation of Postgres functions (causes `TypeError: alasql.fn.function_you_called is not a function` errors; check `fn.js` if the function you're calling already has an implementation. If not, add your own!)
- No type checking

Limitations of Alasql, the project v-js builds on:

- Limited support for non-expression SQL syntax
- Limited support for casting values

And much more.
