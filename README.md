# Speed Stats

Woo.

## Installation

1. Grab: [speedtest-cli](https://github.com/sivel/speedtest-cli) and install it.
2. Install and provision a mysql database. Set up a DSN in your environment   
```
    export SPEEDSTATS_DSN="mysql://user:psd@localhost/speedstats"  
```
3. Checkout this project's source and `npm install` it.
4. Point a crontab at:  
```
SHELL=/bin/bash 
 
1 * * * * /Path/To/speedstats/run.sh `
```
5. Use `npm start` to load the viewer and browse to localhost:3000/view

