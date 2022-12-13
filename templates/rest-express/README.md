# REST API Example

This example shows how to implement a **REST API with TypeScript** using
[Express](https://expressjs.com/) and
[Tigris TypeScript SDK](https://docs.tigrisdata.com/typescript/).

## Getting started

### 1. Download the example

Download this example:

```
npx @tigrisdata/create-tigris-app@latest --example rest-express
```

The above command will also take care of installing the dependencies.

```shell
✔ What is your project named? … /Users/ovaistariq/projects/myapp
✔ What is the clientId? … my_id
✔ What is the clientSecret? … *********
Creating a new app in /Users/ovaistariq/projects/myapp.

Using npm.

Installing dependencies:
- @tigrisdata/core: 1.0.0-beta.21
- express: 4.18.2


added 245 packages, and audited 246 packages in 5s

35 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

Initializing project with template: rest-express

Initialized a git repository.

Success! Created myapp at /Users/ovaistariq/projects/myapp
```

### 2. Start the REST API server

```
npm run dev
```

The server is now running on `http://localhost:3000`. You can now run the API requests, e.g. [`http://localhost:3000/api/users`](http://localhost:3000/api/users).

## Using the REST API

You can access the REST API of the server using the following endpoints:

### `GET`

- `/api/users`: Fetch all users
- `/api/post/:id`: Fetch a single post by its `id`
- `/api/search?searchString={searchString}&page={page}&size={size}&orderBy={orderBy}`: Fetch all _published_ posts
  - Query Parameters
    - `searchString` (required): This filters posts by `title` or `content`
    - `size` (optional): This specifies how many posts should be returned in the result
    - `page` (optional): This specifies the page number to be returned when there are more than one page of search results
    - `orderBy` (optional): The sort order for posts in either ascending or descending order. The value can either `asc` or `desc`
- `/api/user/:id/drafts`: Fetch user's drafts by their `id`

### `POST`

- `/api/signup`: Create a new user
  - Body:
    - `email: String` (required): The email address of the user
    - `name: String` (required): The name of the user
    - `postData: Post[]` (optional): The posts of the user
- `/api/post`: Create a new post
  - Body:
    - `title: String` (required): The title of the post
    - `content: String` (required): The content of the post
    - `authorEmail: String` (required): The email of the user that creates the post

### `PUT`

- `/api/post/:id/publish`: Toggle the publish value of a post by its `id`
- `/api/post/:id/views`: Increases the `viewCount` of a `Post` by one `id`

### `DELETE`

- `/api/post/:id`: Delete a post by its `id`

## Evolving the app

Evolving the application typically requires two steps:

1. Update the data model in the application
2. Update the business logic in the application

For the following example scenario, assume you want to add a "profile" feature to the app where users can create a profile and write a short bio about themselves.

### 1. Update the data model

The first step is to extend the `user` data model:

```diff
// ./src/models/user.ts

import { TigrisCollectionType, TigrisDataTypes, TigrisSchema } from "@tigrisdata/core/dist/types";

export const USER_COLLECTION_NAME = "user";

export interface User extends TigrisCollectionType {
  id?: string;
  email: string;
  name: string;
+  bio: string;
}

export const userSchema: TigrisSchema<User> = {
  id: {
    type: TigrisDataTypes.INT64,
    primary_key: {
      order: 1,
      autoGenerate: true,
    },
  },
  email: {
    type: TigrisDataTypes.STRING,
  },
  name: {
    type: TigrisDataTypes.STRING,
  },
+  bio: {
+    type: TigrisDataTypes.STRING,
+  },
};
```

Once you've updated your data model, restarting the REST API server will
apply the data model changes to the database.

### 2. Update your application code

You can now update the API endpoints to use the new `bio` field in the
`user` collection.

#### 2.1 Add the API endpoint to your app

Update your `./src/api/routes/user.ts` file by adding a new endpoint to your
API:

```ts
// Update the profile of an existing user
app.post("/user/:id/profile", async (req, res, next) => {
  const { id } = req.params;
  const { bio } = req.body;

  let user: User;
  db.transact(async (tx) => {
    const query = { id: id };
    user = await userCollection.findOne(query, undefined, tx);

    if (user === undefined) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        `User with ID ${id} does not exist in the database`
      );
    }

    user.bio = bio;
    const result = await userCollection.updateOne(
      { id: user.id },
      { bio: user.bio },
      tx
    );

    if (!result?.modifiedCount) {
      throw new APIError(
        HttpStatusCode.INTERNAL_SERVER,
        `Failed to add user profile: ${result}`
      );
    }
  })
    .then(() => res.json({ user: user }))
    .catch((error) => next(error));
});
```

#### 2.2 Testing out your new endpoint

Restart your application server and test out your new endpoint.

##### `POST`

- `/api/user/:id/profile`: Create a new profile based on the user id
  - Body:
    - `bio: String` : The bio of the user

## Next steps

- Check out the [Tigris docs](https://docs.tigrisdata.com/)
- Join our [Discord server](http://discord.tigrisdata.com/) and share your
  feedback
