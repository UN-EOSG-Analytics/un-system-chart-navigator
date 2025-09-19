# un-system-chart-navigator

## Resources

- https://www.un.org/en/delegate/page/un-system-chart
- https://www.un.org/two-zero/sites/default/files/2025-06/un80_ms-brief_20250624_4.1.pdf

## Idea

Goal: http://system.un.org/

![UN System](docs/chart.png)

## Maintenance

- `npx shadcn --version` –– 2.10.0
- `npx next --version` –– Next.js v15.4.1

## Dev & Deploy

1. **Install Dependencies**  
    Run the following command to install all required dependencies:
    ```bash
    npm install
    ```

2. **Run Development Server**  
    Start the development server with:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

3. **Build for Production**  
    To create a production build, use:
    ```bash
    npm run build
    ```

4. **Preview Production Build**  
    After building, preview the production build with:
    ```bash
    # npm run start
    node .next/standalone/server.js
    ```