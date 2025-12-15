I started with the server side first to discover the data model and the endpoints. 

The requirements did not specify if the AI model will be tracked at the tenant, or customer, or metric level. I decided to track it at the customer and metric level which feels more realistic and flexible.

I used Claude Code, model Opus 4.5, to assist me in the completion of the project. After the initial setup, and code generation, I shepherded the AI along the path I describe below.
 
To generate the metrics, I used a function to generate normally distributed random numbers instead of a simply using Math.random(). This is more realistic and provides a better distribution of the generated data.

The "metrics since" endpoint could ask for metrics since a very long time ago, which would require generating a lot of data which could consume a lot of memory in the server. I tested this scenario which crashed the server. To fix this bug, I added a limit to the generation window to 30 seconds. Another solution I considered was to validate the parameter input and return an error if the since timestamp is too far in the past. This last approach would require frontend code to handle the error so I chose the first approach because it's simpler.

To requirements mention that the dashboard "must handle hundreds of metric updates per second". Thus, I instructed the AI to generate 100 customers across 7 tenants.

I set the data generation interval to 1 second. Every time the call to "metrics since" is made, new metrics are generated and added to the history. The "stats" endpoint uses all that data to calculate hourly stats. There were several issues with the initial code generation, for example, it was only calculating stats for a few minutes of data, it was trimming the history to only keep the last 10 minutes of data, it was also using a lot of magic numbers, etc.

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

Cost Gauge:
I picked an arbitrary max cost of $250,000 to show a proper gauge with a needle that goes from left to right.


I asked the AI to estimate the memory required to store 5 minutes of metrics... 

To do:
- Displaying "reconnecting" on the dashboard when the exponential backoff is in progress.
- Implementation and testing of 24 hours of metrics.
- Fix labels on x-axis of token usage chart.