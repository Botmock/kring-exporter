# Kring Exporter

This script extends the `@botmock/export` `BaseExporter` in order to generate **`.lg`** and **`.json`** from Botmock projects for use in Microsoft Bot Framework.

## Guide

The following steps will run the script.

> Note: requires [LTS version of Node.js](https://nodejs.org/en/)

- `git clone git@github.com:Botmock/kring-exporter.git`
- `cd kring-exporter`
- `npm install`
- edit`.sample.env` to contain [your token, team id, project id, and board id](http://help.botmock.com/en/articles/2334581-developer-api).
- rename `.sample.env` to `.env`
- `npm start`

By the end of these steps, `./language-generation` should be populated with a single `.lg` file and various `.json` files, which are able to be used in a [C# codebase](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-language-generation?view=azure-bot-service-4.0&tabs=csharp#lg-in-action).
