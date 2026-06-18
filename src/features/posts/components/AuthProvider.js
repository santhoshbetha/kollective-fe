/*
Hard Account Suspension
4. React Frontend (The Forced Logout)
When the Phoenix Socket receives the disconnect signal, it will close the 
connection. You should also add a listener in your React app to clear local state and show a "Suspended" message.
*/

// App.js or AuthProvider.js
socket.onClose(() => {
  // If the disconnect was intentional from the server
  // You might check a reason or just clear the session
  localStorage.removeItem("user_token");
  window.location.href = "/suspended"; // Redirect to a landing page
});

/*
Instant Kick: The Endpoint.broadcast to users_socket:ID with the event "disconnect" is a special Phoenix feature that immediately kills the process on the server. The user's screen will freeze or refresh to a login page.
Re-entry Prevention: Even if the user has a valid cookie/token, the connect/3 function in the socket and your Session Plug will check the suspended_at column and reject them.
Binary ID Precision: Using the UUID in the socket ID ensures you don't accidentally kick the wrong user (which can happen with sequential integer IDs in rare race conditions).
*/