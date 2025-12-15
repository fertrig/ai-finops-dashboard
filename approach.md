I started with the server side first to discover the data model and the endpoints. 

The requirements did not specify if the AI model will be tracked at the tenant, or customer, or metric level. I decided to track it at the customer and metric level which feels more realistic and flexible.

I used Claude Code, model Opus 4.5, to assist me in the completion of the project. After the initial setup, and code generation, I shepherded the AI along the path I describe below.
 
To generate the metrics, I used a function to generate normally distributed random numbers instead of a simply using Math.random(). This is more realistic and provides a better distribution of the generated data.

The "metrics since" endpoint could ask for metrics since a very long time ago, which would require generating a lot of data which could consume a lot of memory in the server. I tested this scenario which crashed the server. To fix this bug, I hardened the server input validation to prevent integer overflow and to prevent the since timestamp from being in the future or more than 1 hour in the past. I also added tests for the input validation.

To requirements mention that the dashboard "must handle hundreds of metric updates per second". Thus, I instructed the AI to generate 100 customers across 7 tenants.

The requirements also called for aggregated-like charts, like spend per hour, top customer, etc. I decided to calculate the stats on the server side and send them to the frontend. This is more efficient than calculating the stats on the frontend side which would require the frontend to download all the data and then calculate the stats.

I set the data generation interval to 1 second. Every time the call to "metrics since" is made, new metrics are generated and added to the history. The "stats" endpoint uses all that data to calculate hourly stats. There were several issues with the initial code generation, for example, it was only calculating stats for a few minutes of data, it was trimming the history to only keep the last 10 minutes of data, it was also using a lot of magic numbers, etc.

I removed code that I was not planning to implement like the /metrics/history endpoint. I don't like to leave code that is not exercised or fully tested.


After I felt the server code was stable enough, I moved on to the frontend.

Since we are polling every few seconds, the status indicator could flicker a lot. To prevent this, 
the status indicator doesn't show "connecting" state. It only shows "connected" or "error" states.

I performed a manual test which helped flush out the dashboard connectivity states: Open the dashboard, leave it open for a while, then kill the server, verify the error visual state. Then start the server again, verify the dashboard is back on the success visual state. When I first run the test, I saw a bug in the status indicator and I also saw that the charts remained the same which gave the impression that there was no error. I fixed the status indicator bug. The charts UX would be a question for a designer.

The initial load was only bringing back last 5 seconds of metrics which made the charts look odd until more data came in. I fixed it so the initial load brings back the last 5 minutes of metrics.

The code that pauses polling when the browser tab is hidden had a bug. After the tab became active again, it was not fetching from the point it left off. I fixed it so it resumes fetching from the point the tab became hidden.

Other adjustments:
- Set token usage chart to 24 hour format to reduce label size.
- Cost by model chart was using metrics instead of stats. It was also randomly selecting colors for each model which made a model have multiple colors over time which was confusing. I fixed it so it uses the stats data and uses a fixed color for each model.
- Fixed responsiveness of the charts.
- Fixed responsiveness of header and polling controls.
- Adjusted colors of polling controls.
- Refactored complex functions into utility functions which I then unit tested.

Cost Gauge:
I picked an arbitrary max cost of $250,000 to show a proper gauge with a needle that goes from left to right.

Token Usage Chart:
The requirements ask for a 5 second resolution on the token usage time serires which works well for intervals of 5 seconds or more. However, when the polling interval is less than 5 seconds, the chart tail behaves oddly as it waits for more data to arrive. I think a better UX is if the resolution of the time series is the same as the polling interval which is what I implemented: as you change the polling interval, the chart resolution changes accordingly which yields a smoother time series.

Top Customers Table:
There was no requirement to display tenants on the dashboard. However, I think it would be useful to know the tenant for the top spenders thus I implemented a simple solution. I added a label to the top customers table to let the user know that the tenant is part of the customer id.

Memory consumption:
I asked the AI to estimate the memory used by storing the metrics in memory in both the server and the front end. It estimated that it is less than 10MB for each. More detail results [here](docs/memory-estimations.md).
I also profiled the dashboard using chrome dev tools. I run "Allocation on timeline" which didn't show any bursts or memory growth over time.

To do:
- Displaying "reconnecting" on the dashboard when the exponential backoff is in progress.
- Implementation and testing of 24 hours of metrics.
- Fix labels on x-axis of token usage chart.
- Implement something like trpc.io to enable type safe communication between frontend and backend.
- Tighten up CORS, it currently allows all origins.
- Tests for the client-side buffering are important. I run out of time to implement them.


More on testing:
- I did not add tests for the data generation since that seemed like a mock feature.
- I added tests for utility functions and complex functions like the backoff logic, time series grouping, and buffer flush logic.