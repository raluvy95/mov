<img src="./movicon.png" align="right" width=100>

# CatNowBot - codename "Mov"

An open source self-hostable Discord bot written in Eris framework. Most likely
a replacement for [Jolly](https://github.com/raluvy95/jolly)

This project is currently in progress, expect to have bugs and frequently
changes to commands/database or other!

# Setting up

1. Just simply run `npm i .`<br>
2. Rename `.env.example` to `.env` and complete there<br>
3. Run with `npm run start`

# Migration from Jolly

We only support database migration for leveling. After running the bot for first
time, kill it and run `node migrationDatabase.js` **with your database.sqlite**
inside the root project. It's recommend to keep database.sqlite at this moment.
