<img src="./movicon.png" align="right" width=100>

# CatNowBot - codename "Mov"

[![Node](https://github.com/raluvy95/mov/actions/workflows/node.yml/badge.svg)](https://github.com/raluvy95/mov/actions/workflows/node.yml)<br>
An open source self-hostable Discord bot written in Eris framework. Most likely
a replacement for [Jolly](https://github.com/raluvy95/jolly)

This project is currently in progress, expect to have bugs and frequently
changes to commands/database or other!

# Setting up

1. Just simply run `npm i .`<br>
2. Rename `.env.example` to `.env` and complete there<br>
3. Run with `npm run start`

# Workarounds

## Migration from Jolly

If you have used Jolly or Jolly-based custom bot, you can migrate level system
to Mov.<br> We only support database migration for leveling. After running the
bot for first time, kill it and run `npm run migrate` **with your
database.sqlite** inside the root project. It's recommend to keep
database.sqlite at this moment.
