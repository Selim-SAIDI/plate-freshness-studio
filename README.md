# Plate Freshness Studio

Smart Food Box – Interactive Food Freshness Testing Platform

Build a modern, premium, interactive and gamified web application called Smart Food Box, designed for restaurants, food merchants and professionals to evaluate and monitor food freshness using an IoT-connected smart box.

The application must have a visually impressive interface, smooth animations, intuitive navigation and a playful but professional user experience.

1. Design and visual identity

Create a modern dashboard with:

Dark navy / deep purple background.

Teal, cyan and violet accent colors.

Glassmorphism cards with subtle gradients.

Rounded corners and soft shadows.

Smooth transitions and micro-interactions.

Modern typography and clean spacing.

Animated icons and illustrations.

Responsive design for desktop, tablet and mobile.

The interface should feel like a combination of a premium SaaS dashboard and an interactive food-building game.

2. Main dashboard

Create a dashboard with a sidebar containing:

Dashboard

New Freshness Test

Test History

Food Inventory

Analytics

Settings

The main dashboard should display:

Total tests performed.

Average estimated freshness score.

Number of dishes currently monitored.

Recent test results.

A chart showing freshness trends over time.

A list of recent activities.

3. Interactive food composition – Main feature

This is the most important part of the application.

Create an interactive screen named Create a New Test.

The merchant should be able to visually compose a dish before testing it.

Design this experience like an interactive food builder game:

Display a large plate in the center of the screen.

Display ingredient categories on the side: vegetables, meat, fish, fruits, dairy products and other ingredients.

Allow the merchant to drag and drop ingredients onto the plate.

Show each selected ingredient visually on the plate.

Allow the merchant to remove ingredients.

Display the dish name and selected ingredients.

Allow the merchant to enter a custom dish name.

Add a button called "Start Freshness Test".

The experience must be visually engaging, with animations when ingredients are added to the plate.

4. Smart Box animation and testing process

After clicking "Start Freshness Test", launch an animated testing sequence.

The sequence must contain the following steps:

Step 1 – Preparing the test

Display the composed dish.

Show a message: "Your dish is ready for analysis".

Ask the merchant to place the dish inside the physical Smart Food Box.

Step 2 – Closing the Smart Box

Display a large animated illustration of the Smart Food Box.

Animate the plate moving inside the box.

Animate the box door closing.

Display a visual indicator showing that the box is closed.

Simulate the reed switch state (open/closed).

Step 3 – Sensor analysis
Once the box is closed, start a simulated measurement process.

Display animated sensor indicators:

Temperature sensor (DS18B20).

Gas/VOC sensor (BME680).

Humidity sensor (BME680).

Weight sensor (HX711).

Door status (Reed Switch).

Show live-looking values with animated updates.

Include a circular progress indicator and a countdown timer. The measurement duration should be configurable.

Display messages during the analysis:

"Initializing sensors..."

"Collecting environmental data..."

"Analyzing gas variations..."

"Evaluating freshness indicators..."

"Preparing your report..."

The merchant must be able to see the analysis progress.

5. Freshness results

When the analysis is completed, display a beautiful results screen.

Include:

A large animated estimated freshness score (0–100).

A visual status indicator.

Temperature.

Humidity.

Gas resistance / VOC indicator.

Measured weight.

Number of box openings.

Test duration.

Use attractive charts and visual indicators.

Add three possible result categories:

Good estimated freshness.

Moderate freshness indicators.

Freshness indicators requiring attention.

Important: The score must be presented as an experimental freshness estimate, not a certified food-safety assessment. Do not claim that a dish is safe to eat based only on sensor readings.

Add a button: "Validate and Save Results".

6. Test history

Create a history page displaying all previous tests.

Each test should include:

Dish name.

Date and time.

Estimated freshness score.

Test status.

Main sensor readings.

Allow filtering by:

Date.

Dish name.

Freshness category.

Allow clicking on a test to display its complete report.

7. Analytics

Create an analytics page with:

Freshness score evolution.

Temperature variations.

Humidity evolution.

Gas resistance evolution.

Comparison between different dishes.

Number of tests per day/week/month.

Use interactive charts and professional data visualizations.

8. Technical implementation

For the first version, build a fully functional frontend prototype using simulated sensor data.

Requirements:

Use React and TypeScript.

Use Tailwind CSS.

Use reusable components.

Use Lucide icons.

Use a chart library such as Recharts.

Use realistic mock data.

Make all navigation and buttons functional.

Store test history locally for the prototype.

Separate the sensor simulation logic from the UI components.

Prepare the architecture for future ESP32 integration through a REST API or WebSocket.

The system should eventually receive real measurements from:

ESP32-WROOM-32.

DS18B20.

BME680.

HX711.

Reed switch.

Do not invent a working hardware connection. For now, clearly indicate when sensor readings are simulated.

9. User experience priorities

The most important feature is the complete interactive testing journey:

Compose Dish → Place Dish in Smart Box → Close Box → Analyze with Sensors → Display Results → Validate and Save.

Make this workflow the central experience of the application.

Do not create a generic administration dashboard. Focus on making the freshness testing experience visually impressive, interactive, intuitive and memorable.

Start by building the complete frontend prototype with realistic simulated data and polished animations.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/68f668b4-0f0d-522f-a80a-d8e22048de25).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
