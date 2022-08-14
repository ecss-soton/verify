# University of Southampton Discord verification service
Service to globally verify and link Southampton students to their Discord accounts

![Soton verify logo](assets/soton-verify.png "Test")

## Run Locally

Clone the project

```bash
  git clone https://github.com/ecss-soton/verify.git
```

Go to the project directory

```bash
  cd verify
```

Install dependencies

```bash
  npm install
```

Have a PostgreSQL server running

Configure the environment variables. See [Environment Variables]

Sync the database with the local schema

```bash
  npm run prisma:dbpush
```

Start the server

```bash
  npm run start
```

Or start with auto refresh in development mode

```bash
  npm run dev
```

### Docker image

TODO Add docker image link with dockerfile

## Schema

![Database Schema](assets/schema.png)

## Running Tests

To run tests, run the following command

```bash
  npm run test
```

## Roadmap

- Get everything working

- Write a roadmap

## Documentation

How this service works

### Authorization

All requests must supply a `Authorization` HTTP header in the format: `Authorization: TOKEN`

#### Example Authorization header

```
Authorization: b583ef41-9c75-41a4-b4ec-19feb0befbd6
```

### Rate limiting

Currently, there are no rate limits in place

### API Reference

#### Get details about a user

```http
  GET /api/v1/user/:userId
```

| Query params    | Type     | Description                                                                                                                                         |
|:----------------|:---------|:----------------------------------------------------------------------------------------------------------------------------------------------------|
| `userId`        | `string` | **Required**. The discord Id of the user you are fetching                                                                                           |

| Body params     | Type     | Description                                                                                                                                         |
|:----------------|:---------|:----------------------------------------------------------------------------------------------------------------------------------------------------|
| `guildId`       | `string` | **Required**. The discord guild Id that is fetching this information <br/> Note that the user must be in the guild otherwise a 404 will be returned |

Returns

```json
{
    "id": "a1cbcb06-b5d8-4769-bbc1-352cf3ebfc4b",
    "discordId": "267292139208048641",
    "sotonId": "ec3g21",
    "firstName": "Euan",
    "lastName": "Caskie",
    "discordTag": "Ortovox#9235",
    "school": "Electronics & Computer Science (Student)",
    "sotonLinkedDate": "2022-06-25T21:25:51.901Z",
    "discordLinkedDate": "2022-06-25T21:47:53.032Z"
}
```

#### Get tokens 

```http
  GET /api/v1/user/:userId/tokens
```

| Query params | Type     | Description                                                          |
|:-------------|:---------|:---------------------------------------------------------------------|
| `userId`     | `string` | **Required**. The discord Id of the user you are fetching            |

| Body params | Type     | Description                                                          |
|:------------|:---------|:---------------------------------------------------------------------|
| `guildId`   | `string` | **Required**. The discord guild Id that is fetching this information |

Returns

```json
{
    "discord": {
        "auth_token": "a1cbcb06-b5d8-4769-bbc1-352cf3ebfc4b",
    },
    "microsoft": {
        "auth_token": "a1cbcb06-b5d8-4769-bbc1-352cf3ebfc4b",
    }
}
```

#### Get guild information

```http
  GET /api/v1/guild/:guildId
```

| Parameter | Type     | Description                                              |
|:----------|:---------|:---------------------------------------------------------|
| `guildId` | `string` | **Required**. The guild Id of the guild you are fetching |

Returns

```json
{
    "id": "689530901142831105",
    "name": "Southampton ECSS",
    "icon": "jkshdkfhskdjhfksjdhf",
    "createdAt": "2022-06-25T21:47:53.032Z",
    "ownerId": "267292139208048641",
    "susuLink": "https://www.susu.org/groups/ecss",
    "roleId": "696959662511358032",
    "roleName": "Verified",
    "roleColour": "#0f12d6",
    "approved": true
}
```