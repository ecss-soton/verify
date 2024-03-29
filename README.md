# University of Southampton Discord verification service
Service to globally verify and link Southampton students to their Discord accounts. See also the [discord bot](https://github.com/ecss-soton/verify-bot)

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

### Environment Variables

To run this project, you will need to add the following environment variables to your .env file

A list of these can also be seen in [.env.example](./.env.example)

```bash
NODE_ENV="development"
DATABASE_URL="In the form `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`"

NEXTAUTH_SECRET="Random bytes for auth crypto"
NEXTAUTH_URL="Absolute URL of the server"

# University of Southampton Azure AD Tenant ID - Change only if you want to auth with a different tenant ( ie univerisity account etc )
AZURE_AD_TENANT_ID="4a5378f9-29f4-4d3e-be89-669d03ada9d8"
AZURE_AD_CLIENT_SECRET="Your Azure AD OAuth application secret"
AZURE_AD_CLIENT_ID="Your Azure AD OAuth application client id"

DISCORD_CLIENT_SECRET="Your discord OAuth application secret"
DISCORD_CLIENT_ID="Your discord OAuth client id"

MAIN_BOT_KEY="Api key of the discord bot you are running"
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

## Documentation

### Versioning

The current api version is `v2`. 

API versions are **NOT** backwards compatible and there *will* be breaking changes between them.

| API Version | Default | Status     | Documentation                                                                                        |
|-------------|---------|------------|------------------------------------------------------------------------------------------------------|
| 2           | Yes     | Available  | [Link](https://github.com/ecss-soton/verify/blob/main/README.md)                                     |
| 1           |         | Deprecated | [Link](https://github.com/ecss-soton/verify/blob/f87f6e92c3f05237bbf9881ea716227c299e3c6f/README.md) |   


### Authorization

All requests must supply a `Authorization` HTTP header in the format: `Authorization: TOKEN`

#### Example Authorization header

```
Authorization: b583ef41-9c75-41a4-b4ec-19feb0befbd6
```

### Rate limiting

Currently, there are no rate limits in place

### Auditing

To provide users of the platform with the best possible experience we implement auditing logging on each request
which can then be viewed by the user to see who accesses their data and when.

You will need to provide the discord ID of the guild that is accessing this data on any request that accesses user information

### API Reference

#### Check if a user is verified or not

```http
  GET /api/v2/verified
```

| Body params | Type     | Description                                                          |
|:------------|:---------|:---------------------------------------------------------------------|
| `discordId` | `string` | The discord user Id to check for                                     |
| `sotonId`   | `string` | The Southampton Id to check for                                      |
| `guildId`   | `string` | **Required**. The discord guild Id that is fetching this information |

Either discordId or sotonId is **required**, but you cannot provide both otherwise an error will be returned

Returns

200 - Success
```json
{
    "verified": true,
    "roleId": "696959662511358032",
    "sotonLinkedDate": "2022-06-25T21:25:51.901Z",
    "discordLinkedDate": "2022-06-25T21:47:53.032Z"
}
```

400 - Bad request
```json
{
    "error": true,
    "message": "Bad request"
}
```

404 - User not found
```json
{
    "error": true,
    "message": "This user does not exist or is not verified in this guild"
}
```

#### Get details about a user 

```http
  GET /api/v2/user
```

| Query params | Type     | Description                                                          |
|:-------------|:---------|:---------------------------------------------------------------------|
| `discordId`  | `string` | The discord user Id to check for                                     |
| `sotonId`    | `string` | The Southampton Id to check for                                      |

Either discordId or sotonId is **required**, but you cannot provide both otherwise an error will be returned

| Body params     | Type     | Description                                                                                                                                         |
|:----------------|:---------|:----------------------------------------------------------------------------------------------------------------------------------------------------|
| `guildId`       | `string` | **Required**. The discord guild Id that is fetching this information <br/> Note that the user must be in the guild otherwise a 404 will be returned |

Returns

200 - Success
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

400 - Bad request
```json
{
    "error": true,
    "message": "Bad request"
}
```

404 - User not found
```json
{
    "error": true,
    "message": "This user does not exist or is not verified in this guild"
}
```

#### Get guild information

```http
  GET /api/v2/guild/:guildId
```

| Query params | Type     | Description                                              |
|:-------------|:---------|:---------------------------------------------------------|
| `guildId`    | `string` | **Required**. The guild Id of the guild you are fetching |

Returns

200 - Success
```json
{
    "id": "689530901142831105",
    "name": "Southampton ECSS",
    "icon": "f67bc40260c9ab413c17cf092308f27c",
    "ownerId": "267292139208048641",
    "susuLink": "https://www.susu.org/groups/ecss",
    "inviteLink": "https://discord.gg/4seH5uMSXU",
    "roleId": "696959662511358032",
    "roleName": "Verified",
    "roleColour": 987862,
    "createdAt": "2022-06-25T21:47:53.032Z",
    "updatedAt": "2022-06-25T21:47:53.032Z",
    "approved": true
}
```

404 - Guild not found
```json
{
    "error": true,
    "message": "This guild does not exist"
}
```

#### Register a new guild

```http
  POST /api/v2/guild/register
```

| Body params  | Type      | Description                                                                   |
|:-------------|:----------|:------------------------------------------------------------------------------|
| `guildId`    | `string`  | **Required**. The guild Id of the guild you are registering                   |
| `name`       | `string`  | **Required**. The name of the guild you are registering                       |
| `ownerId`    | `string`  | **Required**. The discord owner Id of the guild you are registering           |
| `roleId`     | `string`  | **Required**. The role Id for the role to be applied when a user verified     |
| `roleName`   | `string`  | **Required**. The role name for the role to be applied when a user verified   |
| `roleColour` | `integer` | **Required**. The role colour for the role to be applied when a user verified |
| `inviteLink` | `string`  | **Required**. The discord invite link of the server                           |
| `icon`       | `string`  | The icon hash of the guild you are registering                                |
| `susuLink`   | `string`  | The official susu link of the guild you are registering                       |

Returns

200 - Success
```json
{
    "registered": true,
    "approved": false
}
```

409 - Guild already exists (Only if the guild is approved by us)
```json
{
    "error": true,
    "message": "This guild already exists and cannot be modified as it is an approved guild"
}
```