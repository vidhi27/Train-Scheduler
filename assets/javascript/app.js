// Initialize Firebase
var config = {
    apiKey: "AIzaSyC13JRef7AX4QZ37BS84Nj2GWDjARnqUdU",
    authDomain: "train-scheduler-uoft.firebaseapp.com",
    databaseURL: "https://train-scheduler-uoft.firebaseio.com",
    projectId: "train-scheduler-uoft",
    storageBucket: "train-scheduler-uoft.appspot.com",
    messagingSenderId: "901201349570"
};
firebase.initializeApp(config);

// Creates variable for easy reference to Firebase's database
var database = firebase.database();

// function displayTime() {
//     var time = moment().format('HH:mm:ss');
//     $('#clock').html(time);
//     setTimeout(displayTime, 1000);
// }

// $(document).ready(function() {
//     displayTime();
// });

// Creates function that takes place when the Submit button is clicked
$("#add-train-btn").on("click", function (event) {
    event.preventDefault();

    // Grabs user input
    var trainName = $("#train-name-input").val().trim();
    var destination = $("#destination-input").val().trim();
    var firstTrainTime = moment($("#train-time-input").val().trim(), "HH:mm").format("X");
    var freq = $("#frequency-input").val().trim();

    // Creates local "temporary" object for holding train data
    var newTrain = {
        name: trainName,
        destination: destination,
        firstTrainTime: firstTrainTime,
        freq: freq
    };

    // Uploads train data to the database
    database.ref().push(newTrain);

    // Alert when a train is added
    alert("New train successfully added");

    // Clears all of the text-boxes
    $("#train-name-input").val("");
    $("#destination-input").val("");
    $("#train-time-input").val("");
    $("#frequency-input").val("");
});

// Creates Firebase event for adding new train to the database and a row in the html when a user adds an entry
    database.ref().on("child_added", function (childSnapshot, prevChildKey) {

    // Stores everything into a variable
    var trainName = childSnapshot.val().name;
    var destination = childSnapshot.val().destination;
    var firstTrainTime = childSnapshot.val().firstTrainTime;
    var freq = childSnapshot.val().freq;


    // Changes First Train Time into military time from Unix time
    firstTrainTime = moment.unix(firstTrainTime).format("HH:mm");

    // Pushes First Train Time back 1 day to make sure it comes before current time
    var firstTimeConverted = moment(firstTrainTime, "HH:mm").subtract(1, "days");

    // Finds the difference between the Current Time & the First Train Time   
    var diffTime = moment().diff(firstTimeConverted, "minutes");

    // Finds the # of minutes since the last train came
    var remainder = (diffTime - 1440) % freq;

    //Finds the # of minute until the next train
    var minsAway = freq - remainder;

    //Finds the time of the next train in Unix time
    var nextArrival = moment().add(minsAway, "minutes");

    //Changes the time of the next train from Unix time to regular time
    nextArrival = moment(nextArrival).format("LT");

    //Adds each train's data into the table
    $("#train-info-table > tbody").append("<tr><td>" + trainName + "</td><td>" + destination + "</td><td>" +
        freq + "</td><td>" + nextArrival + "</td><td>" + minsAway + "</td><td>" + "<button data-name='" + trainName + "'class='btn btn-default btn-block btn-xs btn-danger'>Delete</button>" + "</td></tr>");


    // Delete function
    $(document).on("click", ".btn-danger", function () {

        var trainKey = $(this).attr("trainName");

        database.ref("newTrain/" + trainKey).remove();

        location.reload();
    });
});

