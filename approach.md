I started with the server side first to discover the data model and the endpoints. 

The requirements did not specify if the AI model will be tracked at the tenant, or customer, or metric level. I decided to track it at the customer and metric level which feels more realistic and flexible.

To generate the metrics, I used a function to generate normally distributed random numbers instead of a simply using Math.random(). This is more realistic and provides a better distribution of the generated data.


