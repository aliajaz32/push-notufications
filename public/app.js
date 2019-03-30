/* ======================== REQUESTING-PUSH-NOTIFICATION  START ======================== */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js').then(function(registration) {

            // Registration was successful
            firebase.messaging().useServiceWorker(registration);

            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {

                    function saveMessagingDeviceToken() {

                        firebase.messaging().getToken().then(function(currentToken) {
                            if (currentToken) {
                                console.log('Got FCM device token:', currentToken);
                                // Saving the Device Token to the datastore.
                                firebase.database().ref('/fcmTokens').child(currentToken)
                                    .set(firebase.auth().currentUser.uid);
                            } else {
                                // Need to request permissions to show notifications.
                                requestforpermision()
                            }
                        }).catch(function(error) {
                            console.error('Unable to get messaging token.', error);
                        });
                    } //Savetoken ends here

                    function requestforpermision() {
                        firebase.messaging().requestPermission().then(function() {
                            // Notification permission granted.
                            saveMessagingDeviceToken();
                        }).catch(function(error) {
                            console.error('Unable to get permission to notify.', error);
                            alert("Your Notifications Are Disabled")
                        });

                    } //Req Permisison ends here
                    requestforpermision()
                }
            });
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

firebase.messaging().onMessage(function(payload) {
    console.log(payload)
});

/* ======================== REQUESTING-PUSH-NOTIFICATION  END ======================== */


/* ======================== SIGNUP-FUNCTION  STARTS ======================== */

function signUp() {
    var email = document.getElementById('email')
    var password = document.getElementById('password')

    firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
        .then(result => {
            console.log('result', result);
        })
        .catch(err => console.log("err ---> ", err.message))

}

/* ======================== SIGNUP-FUNCTION  END ======================== */


/* ======================== SIGNIN-FUNCTION  STARTS ======================== */

function signIn() {
    let userEmail = document.getElementById('user_email')
    let userPassword = document.getElementById('user_password')

    firebase.auth().signInWithEmailAndPassword(userEmail.value, userPassword.value)
        .then(result => console.log('result --->', result))
        .catch(err => console.log('err ----> ', err.message))
}

/* ======================== SIGNIN-FUNCTION  END ======================== */


/* ======================== CHECK_USER-FUNCTION  STARTS ======================== */

function check_user() {
    var registerForm = document.getElementById('register-form')
    var userBox = document.getElementById('user-box')

    var userName = document.getElementById('user-name')

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            registerForm.style.display = 'none'
            userName.innerHTML = "Your are logged in as: " + user.toJSON().email

            console.log(user.toJSON())
            print_all_users()
        } else {
            userBox.style.display = 'none'
        }
    })
}
window.onload = check_user()

/* ======================== CHECK_USER-FUNCTION  END ======================== */


/* ======================== PRINT-ALL-USERS-FUNCTION  STARTS ======================== */

function print_all_users() {
    var list_container = document.getElementById('all-uids');

    firebase.database().ref('/fcmTokens').on('value', data => {
        let myData = data.val()
        var myArr = []
        for (key in myData) {
            myArr.push(myData[key])
        }
        list_container.innerHTML = myArr.map(uid => {
            return `<li>${uid}</li>`
        })
    })

}

/* ======================== PRINT-ALL-USERS-FUNCTION  END ======================== */


/* ======================== SEND-PUSH-NOTIFICATION-FUNCTION  STARTS ======================== */

function sendNotification() {
    var uid = document.getElementById('uid');
    var msg = document.getElementById('msg');

    firebase.database().ref("/fcmTokens").once("value", function(snapshot) {
        snapshot.forEach(function(token) {
            if (token.val() == uid.value) { //Getting the token of the reciever using  if condition..!   
                // console.log(token.key)   
                $.ajax({
                    type: 'POST',
                    url: "https://fcm.googleapis.com/fcm/send",
                    headers: { Authorization: 'key=' + 'AIzaSyDADr8dRiiVNT-a_PAKPVVw-nxb60OipDc' },
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify({
                        "to": token.key,
                        "notification": {
                            "title": `New Notification Recieved`,
                            "body": msg.value,
                            "icon": `https://freeiconshop.com/wp-content/uploads/edd/notification-flat.png`, //Photo of sender
                            "click_action": `https://www.google.com` //Notification Click url notification par click honay k bad iss url par redirect hoga
                        }
                    }),
                    success: function(response) {
                        console.log(response);
                        //Functions to run when notification is succesfully sent to reciever
                    },
                    error: function(xhr, status, error) {
                        //Functions To Run When There was an error While Sending Notification
                        console.log(xhr.error);
                    }
                });
            }
        });
    });

}

/* ======================== SEND-PUSH-NOTIFICATION-FUNCTION  END ======================== */