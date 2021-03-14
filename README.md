<img src="public/img/amber-hotel-full-logo.png" alt="logo" style="width:100px;"/>
<hr/>

AmberHotel is a web application made by us as a project for our studies. It's premise is to work like booking.com where you can easily browse thousands of hotel rooms and apartments to find what suits you best and make a reservation.

A brief list of functionalities:

- Create and edit private or business accounts
- Browse hotels and rooms using filters
- Add rooms to AmberHotel's offer using business accounts
- Book a room and choose a method of payment
- Write reviews about guests and hotels

## Requirements

- Node.js
- npm
- MongoDB


## Setup

### Getting started

Assuming you have already installed required software, download the source code from our repository and navigate to project's root folder (the one with package.json file inside).

Run ```npm install``` command in your terminal to install necessary dependencies. Your output should look something like this:

```less
Thank you for installing EJS: built with the Jake JavaScript build tool (https://jakejs.com/)

added 149 packages from 157 contributors and audited 149 packages in 9.448s

3 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### Application's port

The default port for AmberHotel's server is ```3000```. You can change it by creating an environment variable named ```PORT``` and setting it's value to any valid port number you want.

To learn how to create an environment variable 
on windows go <a href= "https://docs.oracle.com/en/database/oracle/r-enterprise/1.5.1/oread/creating-and-modifying-environment-variables-on-windows.html#GUID-DD6F9982-60D5-48F6-8270-A27EC53807D0">here</a>,
on linux go <a href= "https://www.serverlab.ca/tutorials/linux/administration-linux/how-to-set-environment-variables-in-linux/">here</a> and
on macOS go <a href= "https://medium.com/@youngstone89/setting-up-environment-variables-in-mac-os-28e5941c771c">here</a>.

In case you don't want to create an environment variable, you can change the default port number in the source code. To do that, you have to open ```app.js``` file and modify the following part:

```javascript
//change '3000' to any valid port number you want
app.listen(process.env.PORT || 3000, function () { 
    console.log(`Application started on PORT: ${process.env.PORT || 3000}`);
});
```

### MongoDB

Now you can open the ```mongodb.js``` file (still in project's root folder). You will see a string looking like that:

```javascript
`mongodb://localhost:27017/amberhotel`
```

To connect to your local MongoDB you need to create a cluster named ```amberhotel```.

If you want to use a different cluster name, just replace ```/amberhotel``` with ```/myclustername```.

If your MongoDB instance is running on other port than ```27017``` you can change ```:27017``` to ```:myportnumber```.

### Running the application

AmberHotel's server can be started using either ```node app``` or ```npm start```. If everything was configured correctly you should see a message like this:

```
$ node app
Application started on PORT: 3000
Database connection successful
```

Now you can open your browser and go to ```http://localhost:3000/``` or ```http://localhost:<PORT_NUMBER>/``` if you have changed the default port number.

To turn off the server use ```CTRL + C```.

## Additional info

If you have problems with authorization or connecting to your MongoDB, make sure it's client is running as well as if username, password, host and cluster are correct. If you have passed these values using environment variables, check if their names are right (maybe you've made a typo).

If you get ```Error: listen EADDRINUSE: address already in use``` error message when you are turning on your server, make sure you've shut it down after the last start or whether another app is using your port. If none of these solution work for you - change the port number.

If you've encountered any critical issues with this application, contact us via e-mail or 
<a href="https://github.com/Comscen/amberhotel-nodejs/issues/new">create an issue</a>.

- Michał Tangri - mt.michaltangri@gmail.com
- Sebastian Czajkowski - czaj.sebastian@gmail.com