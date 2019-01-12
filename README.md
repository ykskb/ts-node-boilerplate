# TS Node Boilerplate

Boilerplate for user-facing web application using NodeJs in Typescript.

### Implemented Functionalities

* Authentication and session management with JWT and Redis

* `User` - `UserRole` - `RoleModule` model structure for user role management (including migration & seeder)

* ACLs for Web Routes and API routes

* Minimal views for index and login pages

### Run in Docker Compose

Nginx, Node Js, Redis, MySQL will run together.

```
docker-compose up
```

### Application

##### Build and Static File Copy

```
npm install
npm run build
```

##### Run

```
npm start
```

##### Run on Nodemon

```
npm run dev
```

##### Migrate MySql

```
npm run migrate-mysql
```

##### Seed DB

```
npm run seed
```

##### Run e2e Tests

As of now, test database needs to be created with the name `proj_test` to run tests.

```
npm run test
```

##### Export Code Coverage

Coverage files will be exported in HTML format in `coverage` directory.

```
npm run coverage
```
