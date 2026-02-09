# RgRank Reel Studio

A lightweight bar-racing reel builder powered by `racing-bars`, with structured inputs for multiple data sources (custom JSON, CSV, and World Bank API).

## Getting started

Open `index.html` in your LiveCodes environment (or any static server) and choose a data source:

- **Custom JSON URL**: provide any API URL that returns a list, or a World Bank-style array.
- **World Bank API**: specify an indicator code, country list, and date range.
- **CSV Upload**: load local CSV data.

World Bank indicator examples:

- `SP.POP.TOTL` (population)
- `NY.GDP.MKTP.CD` (GDP current US$)

## Preview online (LiveCodes)

1. Push this repo to GitHub (or another Git host).
2. Open LiveCodes with the GitHub loader:
   `https://livecodes.io/?x=github/<owner>/<repo>`
3. LiveCodes will load `index.html` and run the app instantly.

If you already have a LiveCodes project, you can also use **Import → GitHub** and select this repo.

## Notes

If you switch to World Bank, the mapping keys are auto-filled for the World Bank response format.
