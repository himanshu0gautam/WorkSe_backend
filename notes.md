1. open mongodb atlas - open project atlas - go security section [database & network access] - ip access list - devlopment phase ka liya add ip mein 0.0.0.0 rahgi - lekin production mein hum isme server ki static ip daalage


2. Access token - 
   refresh token - 
ye dono jab user (reg, login) krta waqt generate hota hai
access token - normal token ki tarf treat hota hai - iska main role server ko middleware ka through pta hota hai ki kon sa user req kr rha hai - issa hum khi bhi store nhi krega only 

hum token ko memory mein store kreaga lekin isme ek problem hai isma page refresh(reload) hota hi token hatt jata hai memory clean ho jati hai reload ka baad - to vha pr refresh token kaam mein ata hai - ek alag api create hoti hai /refresh - to user is route pr req krega to refresh token use hoga - access token use nhi kr sakta

or /refresh req hit hota hi server hume return kreaga again second access token
refesh token ka kaam hai dubara sa access token create krna 
refesh token ko hum cookies mein store kr sakta hai


3. frontend mein ye asa kaam hoga ki access token humara 15 mein expire ho jeyga to hume har 15 min baad /refesh api call krni hogi jissa new access token generate ho saka or user web page pr rha saka



eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWM2NDliNjNjNmQ3MTNlMjdiMzgwMzEiLCJpYXQiOjE3OTEzNzk4OTQsImV4cCI6MTc5Mzk3MTg5NH0.D4wXsdtImuu-oqXg9N9h-Spj7zOZSSdKie999SJrLvQ