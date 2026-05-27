# DevTinder APIS

authRouter

- POST /auth/singup
- POST /auth/login
- POST /auth /logout

profileRouter

- GET /profile
- PATCH /profile/edit
- PATCH /profile/password

connectionRequestRouter

- POST /request/send/interested/:userID
- POST /request/send/ignore/:userID

- POST /request/send/accepted/:requestID
- POST /request/send/rejected/:requestID

userRouter

- GET /user/connections
- GET /user/requests/
- GET /user/feed - get all the users

STATUS : ignore , interested , accepted , rejected
