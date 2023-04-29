// This module exports and the anonymous function gets the day information and formats. Stored as getDate.
exports.getDate = function () { 

    // Today's Date
    const today = new Date();

    // Format options on how we view the date.
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
    };

    // Stores the formatted options of date.
    return today.toLocaleDateString("en-US", options);
}

// This module exports and the anonymous function gets the day information and formats. Stored as getDay.
exports.getDay = function () {
    

    // Today's Date
    const today = new Date();

    // Format options on how we view the date.
    const options = {
        weekday: "long",
    };

    // Stores the formatted options of the day.
    return today.toLocaleDateString("en-US", options);
}