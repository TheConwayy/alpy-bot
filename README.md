# IRS Bot

A Discord bot built using the Sapphire framework specifally made for selling insurance
_(ik, weird, right?)_

## Features

- Counter management: Initialize, reset, and delete counters.
- Setting management: View and edit settings.
- Postal code information: Check information about a postal code.
- Routing number information: Check a bank routing number.

## Commands

- `delete-counter`: Delete a counter.
- `init-counters`: Initialize all counters.
- `reset-counters`: Reset all counters.
- `create-counter`: Create a new counter.
- `edit-setting`: Edit a setting.
- `view-settings`: View a setting.
- `postalcode`: Check information about a postal code.
- `routingnumber`: Check a bank routing number.
- `ping`: Test the bot's response time.

## Requirements

- Node.js
- Discord.js
- Sapphire framework

## Installation

1. Clone the repository: `git clone https://github.com/TheConwayy/irs-bot.git`
2. Install dependencies: `npm install`
3. Configure the bot: `cp src/.env.example src/.env` and fill in the required information
4. Build the build: `npm run build`
5. Start the bot: `npm run start`
6. (Optionally) Run the bot in dev mode: `npm run dev`

## Contributing

Contributions are welcome! Please submit a pull request with your changes.

## License

[GNU GPL v3](https://choosealicense.com/licenses/gpl-3.0/#)
